import React from 'react';
import MapPickerModal from '../../components/MapPickerModal';
import PreviewModal from '../../components/PreviewModal';
import AlertModal from '../../components/AlertModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import ClearLineupsModal from '../../components/ClearLineupsModal';

import EditorModal from '../../components/EditorModal';
import ViewerModal from '../../components/ViewerModal';
import Lightbox from '../../components/Lightbox';
import ChangelogModal from '../../components/ChangelogModal';
import ImportLineupModal from '../../components/ImportLineupModal';
import BatchDownloadModal from './components/BatchDownloadModal';
import { BaseLineup, MapOption, LineupSide, NewLineupForm, LineupDbPayload, AgentOption } from '../../types/lineup';
import { LightboxImage } from '../../types/ui';

type Props = {
  isMapModalOpen: boolean;
  maps: MapOption[];
  selectedMap: MapOption | null;
  selectedAgent: AgentOption | null;
  selectedAbilityIndex: number | null;
  setSelectedMap: (v: MapOption | null) => void;
  setIsMapModalOpen: (v: boolean) => void;
  getMapDisplayName: (name: string) => string;
  isPreviewModalOpen: boolean;
  previewInput: string;
  setPreviewInput: (val: string) => void;
  onPreviewClose: () => void;
  onPreviewSubmit: () => void;
  alertMessage: string | null;
  alertActionLabel: string | null;
  alertAction: (() => void) | null;
  alertSecondaryLabel: string | null;
  alertSecondaryAction: (() => void) | null;
  onAlertClose: () => void;
  setAlertMessage: React.Dispatch<React.SetStateAction<string | null>>;
  deleteTargetId: string | null;
  isClearConfirmOpen: boolean;
  selectedAgentName: string | null;
  selectedAgentIcon: string | null;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  onClearConfirm: () => void;
  onClearAgentConfirm: () => void;
  onClearModalClose: () => void;
  isEditorOpen: boolean;
  editingLineupId: string | null;
  newLineupData: NewLineupForm;
  setNewLineupData: (fn: (prev: NewLineupForm) => NewLineupForm) => void;
  handleEditorSave: () => void;
  onEditorClose: () => void;
  selectedSide: 'attack' | 'defense' | 'all';
  setSelectedSide: (val: LineupSide | 'all') => void;
  viewingLineup: BaseLineup | null;
  onViewerClose: () => void;
  handleEditStart: (lineup: BaseLineup) => void;
  setViewingImage: (val: LightboxImage | null) => void;
  getMapEnglishName: (name: string) => string;
  isGuest: boolean;
  viewingImage: LightboxImage | null;
  isChangelogOpen: boolean;
  onChangelogClose: () => void;
  isImportModalOpen: boolean;
  onImportClose: () => void;
  onImportSuccess: (payload: LineupDbPayload) => Promise<BaseLineup>;
  fetchLineups: (userId: string) => void;
  lineups: BaseLineup[];
  isBatchDownloadModalOpen: boolean;
  onBatchDownloadClose: () => void;
  handleBatchDownload: (scope: 'agent' | 'map') => Promise<void>;
  totalAgentLineups: number;
  totalMapLineups: number;
  userId: string | null;
};

const AppModals: React.FC<Props> = ({
  isMapModalOpen,
  maps,
  selectedMap,
  selectedAgent,
  selectedAbilityIndex,
  setSelectedMap,
  setIsMapModalOpen,
  getMapDisplayName,
  isPreviewModalOpen,
  previewInput,
  setPreviewInput,
  onPreviewClose,
  onPreviewSubmit,
  alertMessage,
  alertActionLabel,
  alertAction,
  alertSecondaryLabel,
  alertSecondaryAction,
  onAlertClose,
  setAlertMessage,
  deleteTargetId,
  isClearConfirmOpen,
  selectedAgentName,
  selectedAgentIcon,
  onDeleteCancel,
  onDeleteConfirm,
  onClearConfirm,
  onClearAgentConfirm,
  onClearModalClose,
  isEditorOpen,
  editingLineupId,
  newLineupData,
  setNewLineupData,
  handleEditorSave,
  onEditorClose,
  selectedSide,
  setSelectedSide,
  viewingLineup,
  onViewerClose,
  handleEditStart,
  setViewingImage,
  getMapEnglishName,
  isGuest,
  viewingImage,
  isChangelogOpen,
  onChangelogClose,
  isImportModalOpen,
  onImportClose,
  onImportSuccess,
  fetchLineups,
  lineups,
  isBatchDownloadModalOpen,
  onBatchDownloadClose,
  handleBatchDownload,
  totalAgentLineups,
  totalMapLineups,
  userId,
}) => {
  return (
    <>
      <BatchDownloadModal
        isOpen={isBatchDownloadModalOpen}
        onClose={onBatchDownloadClose}
        currentMapName={selectedMap?.displayName ?? undefined}
        currentMapIcon={selectedMap?.displayIcon}
        currentAgentName={selectedAgentName ?? undefined}
        currentAgentIcon={selectedAgentIcon}
        totalAgentLineups={totalAgentLineups}
        totalMapLineups={totalMapLineups}
        onDownload={handleBatchDownload}
      />

      <MapPickerModal
        isOpen={isMapModalOpen}
        maps={maps}
        selectedMap={selectedMap}
        setSelectedMap={setSelectedMap}
        setIsMapModalOpen={setIsMapModalOpen}
        getMapDisplayName={getMapDisplayName}
      />

      <PreviewModal
        isOpen={isPreviewModalOpen}
        previewInput={previewInput}
        setPreviewInput={setPreviewInput}
        onClose={onPreviewClose}
        onSubmit={onPreviewSubmit}
      />

      <AlertModal
        message={alertMessage}
        actionLabel={alertActionLabel}
        onAction={alertAction}
        secondaryLabel={alertSecondaryLabel}
        onSecondary={alertSecondaryAction}
        onClose={onAlertClose}
      />

      <DeleteConfirmModal deleteTargetId={deleteTargetId} onCancel={onDeleteCancel} onConfirm={onDeleteConfirm} />
      <ClearLineupsModal
        isOpen={isClearConfirmOpen}
        selectedAgentName={selectedAgentName}
        selectedAgentIcon={selectedAgentIcon}
        onClose={onClearModalClose}
        onClearAll={onClearConfirm}
        onClearSelectedAgent={onClearAgentConfirm}
      />

      <EditorModal
        isEditorOpen={isEditorOpen}
        editingLineupId={editingLineupId}
        newLineupData={newLineupData}
        setNewLineupData={setNewLineupData}
        handleEditorSave={handleEditorSave}
        onClose={onEditorClose}
        selectedSide={selectedSide}
        setSelectedSide={setSelectedSide}
        setAlertMessage={setAlertMessage}
        selectedMap={selectedMap}
        selectedAgent={selectedAgent}
        selectedAbilityIndex={selectedAbilityIndex}
        getMapDisplayName={getMapDisplayName}
      />

      <ViewerModal
        viewingLineup={viewingLineup}
        onClose={onViewerClose}
        handleEditStart={handleEditStart}
        setViewingImage={setViewingImage}
        getMapDisplayName={getMapDisplayName}
        getMapEnglishName={getMapEnglishName}
        isGuest={isGuest}
      />

      <Lightbox viewingImage={viewingImage} setViewingImage={setViewingImage} />

      <ChangelogModal isOpen={isChangelogOpen} onClose={onChangelogClose} />

      <ImportLineupModal
        isOpen={isImportModalOpen}
        onClose={onImportClose}
        userId={userId}
        onImportSuccess={onImportSuccess}
        setAlertMessage={(msg) => setAlertMessage(msg)}
        fetchLineups={fetchLineups}
      />
    </>
  );
};

export default AppModals;
