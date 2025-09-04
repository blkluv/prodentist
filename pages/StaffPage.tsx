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
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>Add, edit, or remove staff members.</CardDescription>
          </div>
          <Button onClick={handleOpenModal} className="w-full sm:w-auto">
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Staff
          </Button>
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
                        <Button variant="outline" size="sm" onClick={() => handleEdit(staff)}>Edit</Button>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Update the role for this staff member.' : 'Fill in the details to add a new staff member.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editingStaff?.name} required disabled={!!editingStaff} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingStaff?.email} required disabled={!!editingStaff} />
              </div>
              {!editingStaff && (
                 <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select id="role" name="role" defaultValue={editingStaff?.role || Role.STAFF} required>
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