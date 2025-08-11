import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { TableSelectionCheckbox } from '@/components/TableSelectionCheckbox';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: 'insert' | 'update' | 'delete';
  entity: string;
  entity_id: string | null;
  before_snapshot: any;
  after_snapshot: any;
  created_at: string;
}

export function ActivityLog() {
  const { toast } = useToast();
  const { userRole } = usePermissions();
  const isAdmin = userRole === 'admin';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [userMap, setUserMap] = useState<Record<string, { full_name: string | null; email: string | null }>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) {
      console.error('Failed to fetch audit logs', error);
      toast({ title: 'Error', description: 'Failed to load activity logs', variant: 'destructive' });
    } else {
      setLogs((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  useEffect(() => {
    const loadUsers = async () => {
      const ids = Array.from(new Set(logs.map(l => l.user_id).filter(Boolean) as string[]));
      if (ids.length === 0) {
        setUserMap({});
        return;
      }
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .in('id', ids);
      if (!error && data) {
        const map: Record<string, { full_name: string | null; email: string | null }> = {};
        (data as any[]).forEach((u) => {
          map[u.id] = { full_name: u.full_name ?? null, email: u.email ?? null };
        });
        setUserMap(map);
      }
    };
    loadUsers();
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter(l =>
      (entityFilter === 'all' || l.entity === entityFilter) &&
      (actionFilter === 'all' || l.action === actionFilter) &&
      (!search || (l.entity_id?.toLowerCase().includes(search.toLowerCase()) || l.entity.toLowerCase().includes(search.toLowerCase())))
    );
  }, [logs, entityFilter, actionFilter, search]);

  // Selection helpers
  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const allSelected = useMemo(() => filtered.length > 0 && filtered.every(l => selectedIds.has(l.id)), [filtered, selectedIds]);

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filtered.map(l => l.id)));
  };

  useEffect(() => {
    // prune selections that are no longer present
    setSelectedIds(prev => {
      const next = new Set<string>();
      filtered.forEach(l => { if (prev.has(l.id)) next.add(l.id); });
      return next;
    });
  }, [filtered]);

  const handleDeleteSelected = async () => {
    if (!isAdmin) return;
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast({ title: 'No selection', description: 'Select at least one activity to delete.' });
      return;
    }
    if (!confirm(`Delete ${ids.length} selected activit${ids.length === 1 ? 'y' : 'ies'}?`)) return;
    setLoading(true);
    const { error } = await supabase.from('audit_logs').delete().in('id', ids);
    if (error) {
      console.error('Delete selected failed', error);
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: `Deleted ${ids.length} activit${ids.length === 1 ? 'y' : 'ies'}.` });
      setSelectedIds(new Set());
      await fetchLogs();
    }
    setLoading(false);
  };

  const handleClearAll = async () => {
    if (!isAdmin) return;
    if (!confirm('This will delete all activity logs. Continue?')) return;
    setLoading(true);
    try {
      const { error: rpcError } = await supabase.rpc('admin_clear_audit_logs');
      if (rpcError) {
        const { error } = await supabase.from('audit_logs').delete().not('id', 'is', null as any);
        if (error) throw error;
      }
      toast({ title: 'Cleared', description: 'All activity logs have been deleted.' });
      setSelectedIds(new Set());
      await fetchLogs();
    } catch (e: any) {
      console.error('Clear all failed', e);
      toast({ title: 'Clear failed', description: e?.message || 'Could not clear logs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (log: AuditLog) => {
    if (!isAdmin) return;
    try {
      if (log.entity !== 'subcontracts') {
        toast({ title: 'Undo not available', description: 'Undo is currently supported for subcontracts only.' });
        return;
      }
      const { error } = await supabase.rpc('admin_undo_subcontract', { p_log_id: log.id });
      if (error) throw error;
      toast({ title: 'Undone', description: 'Action has been undone.' });
      fetchLogs();
    } catch (e: any) {
      console.error('Undo failed', e);
      toast({ title: 'Undo failed', description: e?.message || 'Could not undo action', variant: 'destructive' });
    }
  };

  const entities = ['all', 'subcontracts', 'projects', 'subcontractors', 'trades', 'trade_items'];
  const actions = ['all', 'insert', 'delete'];

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-sm text-muted-foreground">Track all changes across key entities. Admins can undo subcontract actions.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium">Entity</label>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {entities.map(e => (<SelectItem key={e} value={e}>{e}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Action</label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {actions.map(a => (<SelectItem key={a} value={a}>{a}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium">Search</label>
            <Input placeholder="Search by entity or ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="md:col-span-4 flex flex-wrap gap-2 justify-end">
            {isAdmin && (
              <>
                <Button variant="destructive" onClick={handleDeleteSelected} disabled={loading || selectedIds.size === 0}>
                  Delete Selected
                </Button>
                <Button variant="destructive" onClick={handleClearAll} disabled={loading || logs.length === 0}>
                  Clear All
                </Button>
              </>
            )}
            <Button variant="outline" onClick={fetchLogs} disabled={loading}>Refresh</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold px-4 py-2">
          {isAdmin && (
            <div className="col-span-1">
              <TableSelectionCheckbox
                checked={allSelected}
                onCheckedChange={(c) => toggleSelectAll(Boolean(c))}
                ariaLabel="Select all activities"
              />
            </div>
          )}
          <div className="col-span-3">Timestamp</div>
          <div className="col-span-2">User</div>
          <div className="col-span-2">Entity</div>
          <div className={isAdmin ? 'col-span-1' : 'col-span-2'}>Action</div>
          <div className="col-span-2">Entity ID</div>
          <div className="col-span-1 text-right">Undo</div>
        </div>
        <div className="divide-y">
          {filtered.map((log) => (
            <div key={log.id} className="grid grid-cols-12 px-4 py-2 items-center text-sm">
              {isAdmin && (
                <div className="col-span-1">
                  <TableSelectionCheckbox
                    checked={selectedIds.has(log.id)}
                    onCheckedChange={(c) => toggleSelect(log.id, Boolean(c))}
                    ariaLabel={`Select activity ${log.id}`}
                  />
                </div>
              )}
              <div className="col-span-3">{new Date(log.created_at).toLocaleString()}</div>
              <div className="col-span-2">{log.user_id ? (userMap[log.user_id]?.full_name || userMap[log.user_id]?.email || log.user_id.slice(0,8)) : 'system'}</div>
              <div className="col-span-2">{log.entity}</div>
              <div className={isAdmin ? 'col-span-1 capitalize' : 'col-span-2 capitalize'}>{log.action}</div>
              <div className="col-span-2 truncate" title={log.entity_id || ''}>{log.entity_id || '-'}</div>
              <div className="col-span-1 text-right">
                {isAdmin && log.entity === 'subcontracts' && (
                  <Button size="sm" variant="outline" onClick={() => handleUndo(log)}>Undo</Button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-sm text-center text-muted-foreground">No activity found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;
