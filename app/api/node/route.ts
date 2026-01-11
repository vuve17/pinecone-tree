import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { title, parentNodeId } = await request.json();

    if (!title || !parentNodeId) {
      return NextResponse.json(
        { error: "Missing title or parentNodeId." },
        { status: 400 }
      );
    }

    const parentNode = await prisma.node.findUnique({
      where: { id: parentNodeId },
      include: { children: true },
    });

    if (!parentNode) {
      return NextResponse.json(
        { error: `Parent node with ID ${parentNodeId} not found.` },
        { status: 404 }
      );
    }

    const nextOrdering = parentNode.children.length + 1;

    const newNode = await prisma.node.create({
      data: {
        title: title.trim(),
        parentNodeId: parentNodeId,
        depth: parentNode.depth + 1,
        ordering: nextOrdering,
      },
    });

    return NextResponse.json(newNode, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create node" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const nodes = await prisma.node.findMany({
      orderBy: [{ depth: "asc" }, { ordering: "asc" }],
    });

    const totalDepthRecord = await prisma.node.aggregate({
      _max: { depth: true },
    });
    const maxDepth = totalDepthRecord._max.depth || 0;

    return new NextResponse(JSON.stringify({ nodes: nodes, total: maxDepth }), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch level range" },
      { status: 500 }
    );
  }
}
