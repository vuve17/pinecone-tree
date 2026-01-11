import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);

    if (isNaN(idParsed)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const node = await prisma.node.findUnique({
      where: { id: idParsed },
      include: {
        children: {
          orderBy: { ordering: "asc", depth: "asc" },
        },
      },
    });

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    return NextResponse.json(node);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);

    if (isNaN(idParsed)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const { title } = await request.json();

    if (typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required and must be a string" },
        { status: 400 }
      );
    }

    if (title.length >= 20) {
      return NextResponse.json(
        { error: "Title length must be between 1 and 20 characters long" },
        { status: 400 }
      );
    }

    const existingNode = await prisma.node.findUnique({
      where: { id: idParsed },
    });

    if (!existingNode) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    const updatedNode = await prisma.node.update({
      where: { id: idParsed },
      data: {
        title: title.trim(),
      },
    });

    return NextResponse.json(updatedNode);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update node" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);

    if (isNaN(idParsed)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    if (idParsed === 1) {
      return NextResponse.json(
        { error: "Root node cannot be deleted" },
        { status: 400 }
      );
    }

    const deleteResponse = await prisma.$transaction(async (tx) => {
      const deletedNode = await tx.node.delete({
        where: { id: idParsed },
      });

      const siblingsToUpdate = await tx.node.findMany({
        where: {
          parentNodeId: deletedNode.parentNodeId,
          ordering: {
            gt: deletedNode.ordering,
          },
        },
        orderBy: {
          ordering: "asc",
        },
      });

      const updatedSiblings = [];
      if (siblingsToUpdate.length) {
        for (const sibling of siblingsToUpdate) {
          const updated = await tx.node.update({
            where: { id: sibling.id },
            data: {
              ordering: sibling.ordering - 1,
            },
          });
          updatedSiblings.push(updated);
        }
      }

      return { deletedNode, updatedSiblings };
    });

    return NextResponse.json({
      deletedNode: deleteResponse.deletedNode,
      updatedSiblings: deleteResponse.updatedSiblings,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Node not found or already deleted" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Delete failed due to an internal error" },
      { status: 500 }
    );
  }
}
