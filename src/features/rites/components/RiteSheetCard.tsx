"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReligiousContentNotice } from "@/components/shared/ReligiousContentNotice";
import type { RiteSheet } from "../api/schemas";

export function RiteSheetCard({ sheet }: { sheet: RiteSheet }) {
  const t = useTranslations("rites");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{sheet.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {t("viewSheet")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-(--dialog-lg)">
            <DialogHeader>
              <DialogTitle>{sheet.title}</DialogTitle>
            </DialogHeader>
            <ReligiousContentNotice validated={sheet.isValidated} />
            <p className="text-sm whitespace-pre-wrap">{sheet.content}</p>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
