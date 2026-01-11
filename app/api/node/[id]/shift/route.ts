import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const nodeId = parseInt(id);

    if (isNaN(nodeId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const { direction } = await request.json();

    if (!direction) {
      return NextResponse.json(
        { error: "Node move direction not found" },
        { status: 404 }
      );
    }

    const currentNode = await prisma.node.findUnique({ where: { id: nodeId } });
    if (!currentNode || !currentNode.parentNodeId) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    const targetOrdering = currentNode.ordering + direction;
    const sibling = await prisma.node.findFirst({
      where: {
        parentNodeId: currentNode.parentNodeId,
        ordering: targetOrdering,
      },
    });

    if (!sibling) {
      return NextResponse.json(
        { error: "No sibling in that direction" },
        { status: 400 }
      );
    }

    const affectedNodes = await prisma.$transaction(async (tx) => {
      const targetNodeMoved = await tx.node.update({
        where: { id: currentNode.id },
        data: { ordering: sibling.ordering },
      });
      const siblinigNodeMoved = await tx.node.update({
        where: { id: sibling.id },
        data: { ordering: currentNode.ordering },
      });
      return [targetNodeMoved, siblinigNodeMoved];
    });

    return NextResponse.json(affectedNodes);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: Record to update not found
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "One of the nodes no longer exists" },
          { status: 404 }
        );
      }
    }
    return NextResponse.json({ error: "Move failed" }, { status: 500 });
  }
}
