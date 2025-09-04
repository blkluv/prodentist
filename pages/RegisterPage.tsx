
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { StethoscopeIcon } from '../components/Icons';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (password.length < 6) {
        setError("Password should be at least 6 characters long.");
        setLoading(false);
        return;
    }
    try {
      await register(name, email, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
       <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <StethoscopeIcon className="w-12 h-12 text-primary"/>
            </div>
            <CardTitle className="text-2xl">Create Staff Account</CardTitle>
            <CardDescription>
                Enter your details below to create an account.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {success ? (
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-primary">Registration Successful!</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Please check your email inbox for a confirmation link to activate your account.
                    </p>
                    <Button asChild className="mt-4 w-full">
                       <Link to="/login">Back to Login</Link>
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </div>
                </form>
            )}
            {!success && (
                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="underline">
                        Sign in
                    </Link>
                </div>
            )}
        </CardContent>
        </Card>
    </div>
  );
};

export default RegisterPage;