import { supabase } from '@/integrations/supabase/client';

type WorkflowEventInput = {
  bookingId: string;
  ownerId: string;
  sitterId: string;
  actorId: string;
  ownerNotification?: { type: string; title: string; message: string };
  sitterNotification?: { type: string; title: string; message: string };
  chatMessage?: string;
};

const findMatchId = async (ownerId: string, sitterId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('matches')
    .select('id, user1_id, user2_id')
    .or(`and(user1_id.eq.${ownerId},user2_id.eq.${sitterId}),and(user1_id.eq.${sitterId},user2_id.eq.${ownerId})`)
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id;
};

export const emitBookingWorkflowEvent = async (input: WorkflowEventInput): Promise<void> => {
  const notificationRows: Array<{
    user_id: string;
    type: string;
    title: string;
    message: string;
    related_id: string;
  }> = [];

  if (input.ownerNotification) {
    notificationRows.push({
      user_id: input.ownerId,
      type: input.ownerNotification.type,
      title: input.ownerNotification.title,
      message: input.ownerNotification.message,
      related_id: input.bookingId,
    });
  }

  if (input.sitterNotification) {
    notificationRows.push({
      user_id: input.sitterId,
      type: input.sitterNotification.type,
      title: input.sitterNotification.title,
      message: input.sitterNotification.message,
      related_id: input.bookingId,
    });
  }

  // Best-effort notifications: workflow must not fail if these fail.
  if (notificationRows.length > 0) {
    await supabase.from('notifications').insert(notificationRows);
  }

  if (!input.chatMessage) return;

  const matchId = await findMatchId(input.ownerId, input.sitterId);
  if (!matchId) return;

  await supabase.from('messages').insert({
    match_id: matchId,
    sender_id: input.actorId,
    content: input.chatMessage,
    read: false,
  });
};

