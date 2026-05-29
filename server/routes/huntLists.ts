import { Router, Request, Response } from "express";
import { withPrisma } from "../../api/utils/db";
import {
  handleGetHuntLists,
  handleCreateHuntList,
  handleRenameHuntList,
  handleDeleteHuntList,
  handleGetHuntListSeries,
  handlePutHuntListSeries,
  handleAddHuntListSeries,
  handleRemoveHuntListSeries,
} from "../../api/handlers/huntLists";

export const huntListsRouter = Router();

type RouteResult = { statusCode: number; headers?: Record<string, string>; body: string };

function send(res: Response, result: RouteResult): void {
  res.status(result.statusCode);
  if (result.headers) {
    Object.entries(result.headers).forEach(([k, v]) => res.set(k, v));
  }
  res.send(result.body);
}

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response) => {
    fn(req, res).catch((err: any) =>
      res.status(500).json({ error: err?.message ?? "Internal server error" })
    );
  };

huntListsRouter.get(
  "/",
  wrap(async (req, res) => {
    const result = await withPrisma(req, (prisma, { userId }) =>
      handleGetHuntLists(prisma, userId)
    );
    send(res, result);
  })
);

huntListsRouter.post(
  "/",
  wrap(async (req, res) => {
    const result = await withPrisma(req, (prisma, { userId }) =>
      handleCreateHuntList(prisma, userId, req.body)
    );
    send(res, result);
  })
);

huntListsRouter.patch(
  "/:id",
  wrap(async (req, res) => {
    const result = await withPrisma(req, (prisma, { userId }) =>
      handleRenameHuntList(prisma, userId, req.params.id, req.body)
    );
    send(res, result);
  })
);

huntListsRouter.delete(
  "/:id",
  wrap(async (req, res) => {
    const result = await withPrisma(req, (prisma, { userId }) =>
      handleDeleteHuntList(prisma, userId, req.params.id)
    );
    send(res, result);
  })
);

huntListsRouter.get(
  "/:id/series",
  wrap(async (req, res) => {
    const result = await withPrisma(req, (prisma, { userId }) =>
      handleGetHuntListSeries(prisma, userId, req.params.id)
    );
    send(res, result);
  })
);

huntListsRouter.put(
  "/:id/series",
  wrap(async (req, res) => {
    const result = await withPrisma(req, (prisma, { userId }) =>
      handlePutHuntListSeries(prisma, userId, req.params.id, req.body)
    );
    send(res, result);
  })
);

huntListsRouter.post(
  "/:id/series",
  wrap(async (req, res) => {
    const result = await withPrisma(req, (prisma, { userId }) =>
      handleAddHuntListSeries(prisma, userId, req.params.id, req.body)
    );
    send(res, result);
  })
);

huntListsRouter.delete(
  "/:id/series",
  wrap(async (req, res) => {
    const result = await withPrisma(req, (prisma, { userId }) =>
      handleRemoveHuntListSeries(prisma, userId, req.params.id, req.body)
    );
    send(res, result);
  })
);
