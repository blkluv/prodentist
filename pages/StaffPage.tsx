import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Staff, Role } from '../types';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectItem } from '../components/ui/Select';
import { PlusCircleIcon } from '../components/Icons';

const StaffPage = () => {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const data = await supabase.from('staff').select();
    setStaffList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const staffData = Object.fromEntries(formData.entries()) as unknown as Omit<Staff, 'id' | 'created_at'>;
    
    if (editingStaff) {
      await supabase.from('staff').update(editingStaff.id, { role: staffData.role });
    } else {
      await supabase.from('staff').insert(staffData);
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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>Add, edit, or remove staff members.</CardDescription>
          </div>
          <Button onClick={handleOpenModal}>
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Staff
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading staff...</p> : (
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
                  <Button variant="outline" size="sm" onClick={() => handleEdit(staff)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Update the role for this staff member.' : 'Fill in the details to add a new staff member.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" defaultValue={editingStaff?.name} className="col-span-3" required disabled={!!editingStaff} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingStaff?.email} className="col-span-3" required disabled={!!editingStaff} />
              </div>
              {!editingStaff && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">Password</Label>
                    <Input id="password" name="password" type="password" className="col-span-3" required />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Select id="role" name="role" defaultValue={editingStaff?.role || Role.STAFF} className="col-span-3 border border-[#eee] rounded px-2 py-1" required>
                  <SelectItem value={Role.STAFF}>Staff</SelectItem>
                  <SelectItem value={Role.ADMIN}>Admin</SelectItem>
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

    </Card>
  );
};

export default StaffPage;