import AdminGroupCardItem from "./AdminGroupCardItem";
import Loading from "./Loading";

// interface AdminGroupCardProps {
//   data: Array<{
//     workgroup: {
//       id: number;
//       title: string;
//       description: string;
//     };
//     users: Array<{
//       id: number;
//       name: string;
//       photo_url?: string;
//       tg_id?: number | null;
//     }>;
//   }>;
// }

interface AdminGroupCardProps {
  data: any;
  loading: boolean;
  companyId: number;
  onDataRefresh: () => Promise<void>;
}

const AdminGroupCard = ({ data, loading, companyId, onDataRefresh }: AdminGroupCardProps) => {
  if (loading) {
    return (
      <div className="py-4">
        <Loading size={24} color={"#2a90ff"} />
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Нет доступных групп для отображения.
      </div>
    );
  }

  return (
    <div className="p-4">
      {data.map((cardData: any, index: number) => (
        <AdminGroupCardItem
          key={cardData.workgroup?.id || `workgroup-${index}`}
          workgroup={cardData.workgroup}
          users={cardData.users}
          taskboards={cardData.taskboards}
          companyId={companyId}
          onDataRefresh={onDataRefresh}
        />
      ))}
    </div>
  );
};

export default AdminGroupCard;
