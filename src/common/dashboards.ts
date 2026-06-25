import { getBackendSrv } from '@grafana/runtime';

// Grafana imports an app plugin's bundled dashboards into the General folder and
// offers no plugin.json option for a target folder. To keep them tidy we group
// them into a dedicated folder ourselves — idempotently, and best-effort: if the
// current user can't create folders / move dashboards (e.g. a Viewer), we simply
// leave them where they are.

const FOLDER_TITLE = 'KubeMeridian';
const DASHBOARD_TAG = 'KubeMeridian';

let done = false;

interface FolderDTO {
  uid: string;
  title: string;
}
interface SearchHit {
  uid: string;
  folderTitle?: string;
}

/**
 * Ensure a "KubeMeridian" folder exists and move the plugin's bundled dashboards
 * (tagged `KubeMeridian`) into it. Runs at most once per page load; only moves
 * dashboards that aren't already in the folder, so it is cheap to re-run.
 */
export async function organizeDashboardsIntoFolder(): Promise<void> {
  if (done) {
    return;
  }
  done = true;

  try {
    const srv = getBackendSrv();

    // 1. Find or create the folder.
    const folders: FolderDTO[] = await srv.get('/api/folders', { limit: 1000 });
    let folder = folders.find((f) => f.title === FOLDER_TITLE);
    if (!folder) {
      folder = (await srv.post('/api/folders', { title: FOLDER_TITLE })) as FolderDTO;
    }
    const folderUid = folder?.uid;
    if (!folderUid) {
      return;
    }

    // 2. Move our dashboards that aren't already in the folder.
    const hits: SearchHit[] = await srv.get('/api/search', { type: 'dash-db', tag: DASHBOARD_TAG, limit: 100 });
    const toMove = hits.filter((h) => h.folderTitle !== FOLDER_TITLE);

    for (const hit of toMove) {
      try {
        const dto: any = await srv.get(`/api/dashboards/uid/${hit.uid}`);
        dto.dashboard.id = null;
        await srv.post('/api/dashboards/db', { dashboard: dto.dashboard, folderUid, overwrite: true });
      } catch {
        // A single dashboard failed (permissions / conflict) — skip it.
      }
    }
  } catch {
    // No permission or API error — leave dashboards in place.
  }
}
