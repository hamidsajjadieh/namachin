import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useAdmin } from '../AdminContext';

/* Media manager: nested folders + image upload/delete with copyable URLs. */
export default function AdminMedia() {
  const { t } = useAdmin();
  const [folders, setFolders] = useState(null);
  const [files, setFiles] = useState(null);
  const [selected, setSelected] = useState(null); // folder id | null = all
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    const [f, m] = await Promise.all([api('/media/folders'), api(`/media/files${selected ? `?folder_id=${selected}` : ''}`)]);
    setFolders(f);
    setFiles(m);
  }, [selected]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const children = (parentId) => (folders || []).filter((f) => (f.parent_id ?? null) === parentId);

  const addFolder = async (parentId) => {
    if (!newName.trim()) return;
    await api('/media/folders', { method: 'POST', body: { name: newName, parent_id: parentId } });
    setNewName('');
    load();
  };
  const removeFolder = async (folder) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await api(`/media/folders/${folder.id}`, { method: 'DELETE' });
      if (selected === folder.id) setSelected(null);
      setError('');
    } catch {
      setError(t('media.folderNotEmpty'));
    }
    load();
  };
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    if (selected) form.append('folder_id', selected);
    await api('/media/upload', { method: 'POST', form });
    e.target.value = '';
    load();
  };
  const removeFile = async (file) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await api(`/media/files/${file.id}`, { method: 'DELETE' });
    load();
  };
  const copyUrl = async (file) => {
    try {
      await navigator.clipboard.writeText(new URL(file.url, window.location.origin).href);
    } catch { /* clipboard blocked */ }
    setCopied(file.id);
    setTimeout(() => setCopied(null), 1200);
  };

  const renderFolder = (f, depth) => (
    <li key={f.id}>
      <div className={`admin-folder${selected === f.id ? ' is-selected' : ''}`} style={{ paddingInlineStart: `${depth * 16 + 6}px` }}>
        <button type="button" className="admin-folder__name" onClick={() => setSelected(f.id)}>
          📁 {f.name} <span className="admin-folder__count">{f.file_count}</span>
        </button>
        <button type="button" className="admin-iconbtn" title={t('media.deleteFolder')} onClick={() => removeFolder(f)}>🗑</button>
      </div>
      {children(f.id).length > 0 && (
        <ul className="admin-folders">{children(f.id).map((c) => renderFolder(c, depth + 1))}</ul>
      )}
    </li>
  );

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <p className="admin-caps">ADMIN / {t('caps.media')}</p>
        <h1 className="admin-page__title">{t('nav.media')}</h1>
        <p className="admin-page__sub">{t('media.manage')}</p>
      </header>

      <div className="admin-media">
        <aside className="admin-media__side admin-panel">
          <h2 className="admin-panel__title">{t('media.folders')}</h2>
          <div className="admin-toolbar admin-toolbar--tight">
            <input className="admin-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('media.newFolder')} />
            <button type="button" className="admin-iconbtn" title={t('media.newFolder')} onClick={() => addFolder(selected)}>＋</button>
          </div>
          <ul className="admin-folders">
            <li>
              <div className={`admin-folder${selected === null ? ' is-selected' : ''}`}>
                <button type="button" className="admin-folder__name" onClick={() => setSelected(null)}>
                  🖼 {t('media.allImages')}
                </button>
              </div>
            </li>
            {(folders || []).filter((f) => f.parent_id == null).map((f) => renderFolder(f, 0))}
          </ul>
        </aside>

        <section className="admin-media__main">
          <div className="admin-toolbar">
            <button type="button" className="admin-btn admin-btn--accent" onClick={() => inputRef.current?.click()}>
              {t('media.upload')}
            </button>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={upload} />
            {error && <p className="admin-modal__error">{error}</p>}
          </div>
          <div className="admin-panel admin-media__grid">
            {files === null ? (
              <p className="admin-empty">{t('common.loading')}</p>
            ) : files.length === 0 ? (
              <p className="admin-empty">{t('common.none')}</p>
            ) : files.map((f) => (
              <figure key={f.id} className="admin-fig">
                <img src={f.url} alt={f.filename} loading="lazy" />
                <figcaption>
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={() => copyUrl(f)}>
                    {copied === f.id ? t('common.copied') : t('common.copyUrl')}
                  </button>
                  <button type="button" className="admin-iconbtn" onClick={() => removeFile(f)}>🗑</button>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
