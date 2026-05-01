import { sb } from '../lib/supabase';

export function isHubPlayer(player, hubPlayerName) {
  return player?.name === hubPlayerName;
}

export function getVisiblePlayers(players = [], hubPlayerName) {
  return players.filter((player) => !isHubPlayer(player, hubPlayerName));
}

export function getNarratorId(room, players = [], hubPlayerName) {
  const visiblePlayers = getVisiblePlayers(players, hubPlayerName);
  return room?.narrator_id || visiblePlayers.find((player) => player.is_host)?.id || players.find((player) => player.is_host)?.id || null;
}

export function getAudience(players = [], narratorId, hubPlayerName) {
  return getVisiblePlayers(players, hubPlayerName).filter((player) => player.id !== narratorId);
}

export function timeAgo(ts) {
  const seconds = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

export function flattenPresence(state = {}) {
  return Object.values(state).flatMap((entries) => entries || []);
}

export async function inspectRoomPresence(roomId) {
  return await new Promise((resolve) => {
    const channel = sb.channel(`presence-room-${roomId}`, { config: { presence: { key: `inspect-${roomId}-${Math.random().toString(36).slice(2, 8)}` } } });
    let done = false;

    const finish = (snapshot = {}) => {
      if (done) return;
      done = true;
      sb.removeChannel(channel);
      resolve(flattenPresence(snapshot));
    };

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') finish(channel.presenceState());
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') finish({});
    });

    setTimeout(() => finish(channel.presenceState?.() || {}), 1200);
  });
}
