"use client";

import { Node } from "@prisma/client";
import { apiClient } from "../app-client";
import { ApiDeleteResponseType } from "../types/api-delete-response.type";
import { getAllNodesType } from "../types/get-all.type";

export const nodeService = {
  getAll: async (): Promise<Node[]> => {
    const { data } = await apiClient.get<getAllNodesType>("/");
    return data.nodes;
  },

  create: async (parentNodeId: number, title: string): Promise<Node> => {
    const { data } = await apiClient.post<Node>("/", {
      parentNodeId,
      title,
    });
    return data;
  },

  reattach: async (id: number, parentNodeId: number): Promise<Node> => {
    const { data } = await apiClient.patch<Node>(`/${id}/reattach`, {
      parentNodeId,
    });
    return data;
  },

  shift: async (id: number, direction: -1 | 1): Promise<Node[]> => {
    const { data } = await apiClient.patch<Node[]>(`/${id}/shift`, {
      direction: direction,
    });
    return data;
  },

  update: async (id: number, title: string): Promise<Node> => {
    const { data } = await apiClient.patch<Node>(`/${id}`, { title });
    return data;
  },

  delete: async (id: number): Promise<ApiDeleteResponseType> => {
    const { data } = await apiClient.delete<ApiDeleteResponseType>(`/${id}`);
    return data;
  },
};
