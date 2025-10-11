import { useState } from 'react';
import { User, LogOut, Mail, KeyRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function UserMenu() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Até logo!',
        description: 'Você foi desconectado com sucesso.',
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível sair.',
        variant: 'destructive',
      });
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) throw error;

      toast({
        title: 'Email atualizado!',
        description: 'Verifique seu novo email para confirmar a mudança.',
      });
      setEmailDialogOpen(false);
      setNewEmail('');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o email.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;

      toast({
        title: 'Senha atualizada!',
        description: 'Sua senha foi alterada com sucesso.',
      });
      setPasswordDialogOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a senha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Trocar Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            Redefinir Senha
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Email Change Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar Email</DialogTitle>
            <DialogDescription>
              Digite seu novo email. Você receberá uma confirmação no novo endereço.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Novo Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="novo@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmailDialogOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Atualizando...' : 'Atualizar Email'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Digite sua nova senha. Ela deve ter pelo menos 6 caracteres.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
