import { saveLineupApi, updateLineupApi, deleteLineupApi, clearLineupsApi, clearLineupsByAgentApi } from '../services/lineups';
import { LineupDbPayload, BaseLineup } from '../types/lineup';

export const useLineupActions = () => {
  const saveNewLineup = async (payload: LineupDbPayload): Promise<BaseLineup> => {
    return saveLineupApi(payload);
  };

  const updateLineup = async (id: string, payload: Partial<LineupDbPayload>) => {
    await updateLineupApi(id, payload);
  };

  const deleteLineup = async (id: string) => {
    await deleteLineupApi(id);
  };

  const clearLineups = async (userId: string) => {
    await clearLineupsApi(userId);
  };

  const clearLineupsByAgent = async (userId: string, agentName: string) => {
    await clearLineupsByAgentApi(userId, agentName);
  };

  return { saveNewLineup, updateLineup, deleteLineup, clearLineups, clearLineupsByAgent };
};
