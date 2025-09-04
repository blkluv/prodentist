import React, { useState, useEffect, useCallback } from 'react';
import { Patient } from '../types';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { PlusCircleIcon } from '../components/Icons';

const PatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (data) {
        setPatients(data);
    }
    if (error) {
        console.error('Error fetching patients:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const patientData = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        email: formData.get('email') as string || null,
        phone: formData.get('phone') as string || null,
        address: formData.get('address') as string || null,
    };
    
    let error;
    if (editingPatient) {
      ({ error } = await supabase.from('patients').update(patientData).eq('id', editingPatient.id));
    } else {
      ({ error } = await supabase.from('patients').insert(patientData));
    }

    if (error) {
        console.error("Error saving patient:", error);
        // You could add user-facing error handling here
    } else {
        fetchPatients();
        handleModalClose();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Patient Management</CardTitle>
            <CardDescription>View, add, edit, or remove patient records.</CardDescription>
          </div>
          <Button onClick={handleOpenModal} className="w-full sm:w-auto">
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading patients...</p> : (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {patients.map((patient) => (
                    <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.first_name}</TableCell>
                        <TableCell>{patient.last_name}</TableCell>
                        <TableCell>{patient.email || 'N/A'}</TableCell>
                        <TableCell>{patient.phone || 'N/A'}</TableCell>
                        <TableCell>{patient.address || 'N/A'}</TableCell>
                        <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(patient)}>Edit</Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
                {patients.map((patient) => (
                    <Card key={patient.id}>
                        <CardHeader>
                            <CardTitle>{patient.first_name} {patient.last_name}</CardTitle>
                            <CardDescription>{patient.email || 'No email provided'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <p className="text-sm"><strong>Phone:</strong> {patient.phone || 'N/A'}</p>
                             <p className="text-sm"><strong>Address:</strong> {patient.address || 'N/A'}</p>
                             <p className="text-sm text-muted-foreground"><strong>Registered:</strong> {new Date(patient.created_at).toLocaleDateString()}</p>
                        </CardContent>
                        <div className="flex items-center p-6 pt-0">
                           <Button variant="outline" size="sm" onClick={() => handleEdit(patient)}>Edit</Button>
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
            <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
            <DialogDescription>
              {editingPatient ? 'Update the details for this patient.' : 'Fill in the details for the new patient.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" name="first_name" defaultValue={editingPatient?.first_name} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" defaultValue={editingPatient?.last_name} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingPatient?.email ?? ''} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={editingPatient?.phone ?? ''} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={editingPatient?.address ?? ''} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleModalClose}>Cancel</Button>
              <Button type="submit">Save Patient</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PatientsPage;