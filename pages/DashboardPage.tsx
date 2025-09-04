
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { StethoscopeIcon, UsersIcon } from '../components/Icons';
import { supabase } from '../services/supabase';

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ staffCount: 0, patientCount: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            // FIX: The `.count()` method does not exist on the query builder.
            // The correct way to get the count is to use `select` with the `count` option.
            const { count: staffCount } = await supabase.from('staff').select('*', { count: 'exact', head: true });
            const { count: patientCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });
            setStats({ staffCount: staffCount ?? 0, patientCount: patientCount ?? 0 });
        };

        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">Here's a summary of the clinic's activity.</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <StethoscopeIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.patientCount}</div>
                        <p className="text-xs text-muted-foreground">Managed in the system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.staffCount}</div>
                        <p className="text-xs text-muted-foreground">Currently employed</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
