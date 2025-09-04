import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Staff, Role } from '../types';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectItem } from '../components/ui/Select';

const StaffPage = () => {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    if (data) {
        setStaffList(data);
    }
    if (error) {
        console.error("Error fetching staff:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRole = formData.get('role') as Role;
    
    if (editingStaff) {
      const { error } = await supabase.from('staff').update({ role: newRole }).eq('id', editingStaff.id);
      if (error) {
          console.error("Error updating staff role:", error);
      }
    }
    
    fetchStaff();
    handleModalClose();
  };

  if (user?.role !== Role.ADMIN) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You must be an administrator to manage staff.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>
                Manage staff roles. New staff can sign up via the public registration page.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading staff...</p> : (
            <>
            {/* Desktop Table */}
            <div className="hidden md:block">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staffList.map((staff) => (
                    <TableRow key={staff.id}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>{staff.email}</TableCell>
                        <TableCell className="capitalize">{staff.role}</TableCell>
                        <TableCell>{new Date(staff.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(staff)}>Edit Role</Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
                {staffList.map((staff) => (
                    <Card key={staff.id}>
                        <CardHeader>
                            <CardTitle>{staff.name}</CardTitle>
                            <CardDescription>{staff.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <p className="text-sm"><strong>Role:</strong> <span className="capitalize">{staff.role}</span></p>
                             <p className="text-sm text-muted-foreground"><strong>Joined:</strong> {new Date(staff.created_at).toLocaleDateString()}</p>
                        </CardContent>
                        <div className="flex items-center p-6 pt-0">
                           <Button variant="outline" size="sm" onClick={() => handleEdit(staff)}>Edit Role</Button>
                        </div>
                    </Card>
                ))}
            </div>
          </>
        )}
      </CardContent>

      {editingStaff && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit Staff Role</DialogTitle>
                <DialogDescription>
                Update the role for {editingStaff.name}.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
                <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={editingStaff?.name} disabled />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={editingStaff?.email} disabled />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select id="role" name="role" defaultValue={editingStaff?.role || Role.ASSISTANT} required>
                      <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                      <SelectItem value={Role.DENTIST}>Dentist</SelectItem>
                      <SelectItem value={Role.ASSISTANT}>Assistant</SelectItem>
                      <SelectItem value={Role.RECEPTIONIST}>Receptionist</SelectItem>
                    </Select>
                </div>
                </div>
                <DialogFooter>
                <Button type="button" variant="secondary" onClick={handleModalClose}>Cancel</Button>
                <Button type="submit">Save changes</Button>
                </DialogFooter>
            </form>
            </DialogContent>
        </Dialog>
      )}

    </Card>
  );
};

export default StaffPage;