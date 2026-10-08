import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { MyRoomsCard } from "@/features/rooms/components/MyRoomsCard";
import { BlocsAgence, CreerBloc } from "./AllotementAgence";

/** Hébergement (idée #40) : allotement pour l'agence, sa chambre pour le pèlerin. */
export default async function RoomsPage() {
  const t = await getTranslations("rooms");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Can role="agency">
            <CreerBloc />
          </Can>
        }
      />
      <Can role="agency">
        <BlocsAgence />
      </Can>
      <Can role="pilgrim">
        <MyRoomsCard />
      </Can>
    </div>
  );
}
