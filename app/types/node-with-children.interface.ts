import { Node } from "@prisma/client";

export interface NodeWithChildren extends Node {
  children?: Node[];
}
