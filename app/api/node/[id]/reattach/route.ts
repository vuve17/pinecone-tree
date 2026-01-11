import prisma from "@/app/lib/prisma";
import { isDescendant } from "@/app/utils/is-descendant-helper-func";
import { updateDescendantsDepth } from "@/app/utils/update-descentant-depth";
import { NextResponse } from "next/server";

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

    if (idParsed === 1) {
      return NextResponse.json(
        { error: "Root node cannot be moved" },
        { status: 400 }
      );
    }

    const { parentNodeId } = await request.json();

    if (!parentNodeId) {
      return NextResponse.json(
        {
          error: "Parent node ID is required.",
        },
        { status: 400 }
      );
    }

    if (idParsed === parentNodeId) {
      return NextResponse.json(
        { error: "A node cannot be its own parent." },
        { status: 400 }
      );
    }

    const targetParent = await prisma.node.findUnique({
      where: { id: parentNodeId },
    });

    if (!targetParent) {
      return NextResponse.json(
        { error: "Target parent node not found" },
        { status: 404 }
      );
    }

    const existingNode = await prisma.node.findUnique({
      where: { id: idParsed },
    });

    if (!existingNode) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    const allNodes = await prisma.node.findMany();
    if (isDescendant(allNodes, idParsed, parentNodeId)) {
      return NextResponse.json(
        { error: "Cannot move a parent into its own descendant." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const newDepth = targetParent.depth + 1;
      const orderCount = await tx.node.count({
        where: { parentNodeId: parentNodeId },
      });

      const updatedNode = await tx.node.update({
        where: { id: idParsed },
        data: {
          parentNodeId: parentNodeId,
          ordering: orderCount + 1,
          depth: newDepth,
        },
      });

      const siblingsToShift = await tx.node.findMany({
        where: {
          parentNodeId: existingNode.parentNodeId,
          ordering: { gt: existingNode.ordering },
        },
      });

      if (siblingsToShift.length) {
        await tx.node.updateMany({
          where: {
            parentNodeId: existingNode.parentNodeId,
            ordering: { gt: existingNode.ordering },
          },
          data: {
            ordering: { decrement: 1 },
          },
        });
      }

      console.log(
        "New depth:",
        newDepth,
        "Order count:",
        orderCount,
        "Updated node:",
        updatedNode,
        "parentNodeId: ",
        parentNodeId
      );

      await updateDescendantsDepth(prisma, updatedNode.id, updatedNode.depth);

      return updatedNode;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Node ordering update failed" },
      { status: 500 }
    );
  }
}
