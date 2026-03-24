import React from "react";
import { Upload, WifiOff } from "lucide-react";
import Button from "../shared/Button";
import ClearDatabase from "../ClearDatabase";
import { Comic } from "../../types";
import * as S from "./styles";
import ThemeSwitcher from "../ThemeSwitcher";

interface Props {
  isOpen: boolean;
  onImport: (comics: Comic[]) => void;
  onClose: () => void;
  onOpenImportModal: () => void;
  importStatus?: string; // Optional status to show import progress
  onSyncOffline?: () => void;
  isSyncingOffline?: boolean;
  lastSyncedAt?: string | null;
  offlineSyncError?: string | null;
  showHiddenPublishers: boolean;
  onShowHiddenPublishersChange: (show: boolean) => void | Promise<void>;
  showHiddenSeries: boolean;
  onShowHiddenSeriesChange: (show: boolean) => void | Promise<void>;
  /** True after "Hide collected publishers" hid at least one item (persisted). */
  autoHidePublishersActive?: boolean;
  autoHideSeriesActive?: boolean;
  onHideCollectedPublishers?: () => void;
  onHideCollectedSeries?: () => void;
}

const HamburgerMenu: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenImportModal,
  importStatus,
  onSyncOffline,
  isSyncingOffline,
  lastSyncedAt,
  offlineSyncError,
  showHiddenPublishers,
  onShowHiddenPublishersChange,
  showHiddenSeries,
  onShowHiddenSeriesChange,
  autoHidePublishersActive = false,
  autoHideSeriesActive = false,
  onHideCollectedPublishers,
  onHideCollectedSeries,
}) => {
  if (!isOpen) return null;

  const handleImportClick = () => {
    onOpenImportModal();
    onClose(); // Close the hamburger menu when opening import modal
  };

  return (
    <S.MenuContainer data-sc="MenuContainer">
      <S.CloseButton size={24} onClick={onClose} data-sc="CloseButton" />
      <S.MenuTitle data-sc="MenuTitle">Menu</S.MenuTitle>

      <S.MenuOption data-sc="MenuOption">
        <Button
          onClick={handleImportClick}
          icon={Upload}
          variant="primary"
          fullWidth
        >
          Import Comics
          {importStatus && (
            <S.StatusIndicator>{importStatus}</S.StatusIndicator>
          )}
        </Button>
      </S.MenuOption>

      {onSyncOffline && (
        <S.MenuOption data-sc="MenuOption">
          <Button
            onClick={onSyncOffline}
            icon={WifiOff}
            variant="secondary"
            fullWidth
            disabled={isSyncingOffline}
          >
            {isSyncingOffline ? "Syncing for Offline..." : "Sync Collection for Offline Use"}
          </Button>
          {lastSyncedAt && (
            <S.StatusIndicator>
              Last synced: {new Date(lastSyncedAt).toLocaleString()}
            </S.StatusIndicator>
          )}
          {offlineSyncError && (
            <S.StatusIndicator>{offlineSyncError}</S.StatusIndicator>
          )}
        </S.MenuOption>
      )}

      <S.MenuOption data-sc="MenuOptionVisibility">
        <S.SectionLabel>Visibility</S.SectionLabel>
        <S.ShowHiddenGroup>
          <S.ShowHiddenLabel>
            <input
              type="checkbox"
              id="menu-show-hidden-publishers"
              checked={showHiddenPublishers}
              onChange={(e) => {
                void onShowHiddenPublishersChange(e.target.checked);
              }}
              aria-label="Show hidden publishers"
              data-sc="ShowHiddenPublishers"
            />
            <span>Show hidden publishers</span>
          </S.ShowHiddenLabel>
          <S.ShowHiddenLabel>
            <input
              type="checkbox"
              id="menu-show-hidden-series"
              checked={showHiddenSeries}
              onChange={(e) => {
                void onShowHiddenSeriesChange(e.target.checked);
              }}
              aria-label="Show hidden series"
              data-sc="ShowHiddenSeries"
            />
            <span>Show hidden series</span>
          </S.ShowHiddenLabel>
        </S.ShowHiddenGroup>
        <S.MenuHint>
          Manual hides are stored in your hidden lists (publishers sync to the server; series stay on this
          device). &quot;Hide collected&quot; below adds anything that is 100% collected.
        </S.MenuHint>
      </S.MenuOption>

      {(onHideCollectedPublishers || onHideCollectedSeries) && (
        <S.MenuOption data-sc="MenuOptionQuickHide">
          <S.SectionLabel>Quick hide</S.SectionLabel>
          <S.QuickHideStack>
            {onHideCollectedPublishers && (
              <div>
                <Button
                  onClick={() => {
                    onHideCollectedPublishers();
                    onClose();
                  }}
                  variant={autoHidePublishersActive ? "primary" : "secondary"}
                  fullWidth
                >
                  Hide collected publishers
                </Button>
                {autoHidePublishersActive && (
                  <S.ActiveActionHint>
                    Active — last run hid at least one publisher
                  </S.ActiveActionHint>
                )}
              </div>
            )}
            {onHideCollectedSeries && (
              <div>
                <Button
                  onClick={() => {
                    onHideCollectedSeries();
                    onClose();
                  }}
                  variant={autoHideSeriesActive ? "primary" : "secondary"}
                  fullWidth
                >
                  Hide collected series
                </Button>
                {autoHideSeriesActive && (
                  <S.ActiveActionHint>
                    Active — last run hid at least one series
                  </S.ActiveActionHint>
                )}
              </div>
            )}
          </S.QuickHideStack>
        </S.MenuOption>
      )}

      <S.MenuOption data-sc="MenuOption">
        <ThemeSwitcher />
      </S.MenuOption>

      <S.MenuOption data-sc="MenuOption">
        <ClearDatabase />
      </S.MenuOption>
    </S.MenuContainer>
  );
};

export default HamburgerMenu;
