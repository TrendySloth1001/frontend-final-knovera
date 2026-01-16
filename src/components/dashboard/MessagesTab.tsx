import Messages from "../Messages";

interface MessagesTabProps {
  messageUserId: string | null;
  setMessageUserId: (userId: string | null) => void;
  changeTab: (tab: string) => void;
}

export default function MessagesTab({
  messageUserId,
  setMessageUserId,
  changeTab,
}: MessagesTabProps) {
  return (
    <div className="h-full overflow-hidden">
      <Messages
        initialUserId={messageUserId || undefined}
        onClose={() => {
          setMessageUserId(null);
          changeTab('Overview');
        }}
      />
    </div>
  );
}
