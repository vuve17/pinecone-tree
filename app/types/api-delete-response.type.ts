import { Node } from "@prisma/client";

export type ApiDeleteResponseType = {
  deletedNode: Node;
  updatedSiblings: Node[] | null;
};
