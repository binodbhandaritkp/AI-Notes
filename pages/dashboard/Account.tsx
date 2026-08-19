import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, AlertTriangle, Save, Camera, Lock, ChevronRight, Globe, Key, Trash2, Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../src/supabaseClient';
import { RoutePath } from '../../types';
import { storageService } from '../../services/storageService';
import { StorageImage } from '../../components/ui/StorageImage';

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // User specific state
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    displayName: '',
    timezone: 'UTC-8 (Pacific Time)'
  });
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  // Fetch Supabase User on Mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate(RoutePath.LOGIN);
          return;
        }

        setUserId(user.id);
        setEmail(user.email || '');
        setAvatarPath(user.user_metadata?.avatar_url || null);
        
        setFormData({
          fullName: user.user_metadata?.full_name || '',
          displayName: user.user_metadata?.display_name || '',
          timezone: user.user_metadata?.timezone || 'UTC-8 (Pacific Time)'
        });
      } catch (error: any) {
        console.error("Error fetching user:", error);
        setErrorMessage(error?.message || "Failed to load account details");
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && userId) {
      try {
        setAvatarLoading(true);
        setStatusMessage(null);
        setErrorMessage(null);

        // If there's an existing uploaded avatar in storage, clean it up
        const previousAvatar = avatarPath;
        if (previousAvatar && !previousAvatar.startsWith('http') && !previousAvatar.startsWith('blob:') && !previousAvatar.startsWith('data:')) {
          await storageService.deleteFile(previousAvatar);
        }

        // Upload new avatar to ${userId}/avatars/profile/${uuid}.${ext}
        const path = await storageService.uploadFile(
          file, 
          userId, 
          'avatars', 
          'profile'
        );
        
        // Update state and user profile
        setAvatarPath(path);
        
        const { error } = await supabase.auth.updateUser({
          data: { avatar_url: path }
        });
        
        if (error) throw error;
        setStatusMessage("Profile photo updated successfully!");
        setTimeout(() => setStatusMessage(null), 4000);
        
      } catch (error: any) {
        console.error("Error uploading avatar:", error);
        setErrorMessage(error?.message || "Failed to upload avatar.");
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarPath) return;
    try {
      setAvatarLoading(true);
      setStatusMessage(null);
      setErrorMessage(null);

      // Clean up from storage
      if (!avatarPath.startsWith('http') && !avatarPath.startsWith('blob:') && !avatarPath.startsWith('data:')) {
        await storageService.deleteFile(avatarPath);
      }

      setAvatarPath(null);

      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (error) throw error;
      setStatusMessage("Profile photo removed.");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      setErrorMessage(error?.message || "Failed to remove avatar.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          display_name: formData.displayName,
          timezone: formData.timezone
        }
      });

      if (error) throw error;
      
      setStatusMessage("Account information saved successfully!");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setErrorMessage(error?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return;
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/account',
      });
      if (error) {
        setErrorMessage(error.message);
      } else {
        setStatusMessage('Password reset email has been sent. Please check your inbox.');
        setTimeout(() => setStatusMessage(null), 6000);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send password reset email.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(RoutePath.LOGIN);
  };

  if (fetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-slate-500">
         <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            <span className="text-sm font-medium">Loading account...</span>
         </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-300/10 rounded-full blur-[120px] -z-10 mix-blend-multiply pointer-events-none" />
        <div className="absolute bottom-0 right-[-10%] w-[800px] h-[800px] bg-fuchsia-100/20 rounded-full blur-[100px] -z-10 mix-blend-multiply pointer-events-none" />

        {/* Status / Error Toast Banners */}
        {statusMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 text-sm font-medium text-emerald-800 backdrop-blur-xl shadow-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/90 p-4 text-sm font-medium text-rose-800 backdrop-blur-xl shadow-sm animate-in fade-in slide-in-from-top-2">
            <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Glass Panel */}
        <div className="relative rounded-[40px] border border-white/60 bg-white/40 backdrop-blur-[80px] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.05),0_10px_30px_-5px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 hover:shadow-[0_50px_120px_-20px_rgba(0,0,0,0.08)] ring-1 ring-white/50">
            
            {/* Top Gloss Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />

            <form onSubmit={handleSubmit} className="divide-y divide-white/40">
                
                {/* Header Section */}
                <div className="px-10 py-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-50 pointer-events-none" />
                    
                    {/* Avatar Group */}
                    <div className="group relative mb-4 cursor-pointer" onClick={() => !avatarLoading && document.getElementById('avatar-upload')?.click()}>
                        <div className="h-32 w-32 rounded-full p-1 bg-white/50 backdrop-blur-xl border border-white shadow-xl transition-transform duration-500 group-hover:scale-105 relative overflow-hidden">
                             {avatarLoading ? (
                                <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-indigo-500">
                                  <Loader2 className="animate-spin" size={32} />
                                </div>
                             ) : avatarPath ? (
                                <StorageImage 
                                    path={avatarPath} 
                                    alt="Profile" 
                                    className="h-full w-full rounded-full object-cover" 
                                />
                             ) : (
                                <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-indigo-300">
                                    <User size={48} />
                                </div>
                             )}
                        </div>
                        <button type="button" disabled={avatarLoading} className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg ring-1 ring-slate-100 transition-all hover:scale-110 hover:text-indigo-600">
                            <Camera size={18} />
                        </button>
                        <input 
                            id="avatar-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleAvatarChange}
                            disabled={avatarLoading}
                        />
                    </div>

                    {avatarPath && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={avatarLoading}
                        className="mb-4 text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors"
                      >
                        Remove profile photo
                      </button>
                    )}

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                        {formData.fullName || formData.displayName || email.split('@')[0] || 'User'}
                    </h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2 bg-white/40 px-4 py-1.5 rounded-full border border-white/40">
                        <Mail size={14} />
                        {email}
                    </p>
                </div>

                {/* Main Settings Grid */}
                <div className="px-6 sm:px-12 py-12 space-y-12 bg-white/20">
                    
                    {/* Section: Profile Information */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                             <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 ring-1 ring-blue-100 shadow-sm">
                                 <User size={16} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <Input 
                                label="Full Name" 
                                name="fullName" 
                                value={formData.fullName} 
                                onChange={handleChange} 
                                placeholder="e.g. Jane Doe"
                                className="bg-white/70 border-white/50 focus:bg-white"
                             />
                             <Input 
                                label="Display Name" 
                                name="displayName" 
                                value={formData.displayName} 
                                onChange={handleChange} 
                                placeholder="e.g. Jane"
                                className="bg-white/70 border-white/50 focus:bg-white"
                             />
                        </div>

                        <div>
                             <label className="ml-1 mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500/80">
                                Timezone
                            </label>
                            <div className="relative group">
                                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 z-10 transition-colors" size={18} />
                                <select
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    className="w-full appearance-none rounded-2xl border border-white/50 bg-white/70 pl-12 pr-5 py-4 text-[15px] font-medium text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 hover:bg-white/90 hover:shadow-md focus:border-indigo-500/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                >
                                    <option>UTC-8 (Pacific Time)</option>
                                    <option>UTC-5 (Eastern Time)</option>
                                    <option>UTC+0 (London)</option>
                                    <option>UTC+1 (Paris)</option>
                                    <option>UTC+9 (Tokyo)</option>
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Section: Security */}
                    <div className="space-y-6 pt-6 border-t border-slate-200/40">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100 shadow-sm">
                                 <Shield size={16} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-lg font-semibold text-slate-900">Security & Login</h3>
                        </div>

                        <div className="rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                        <Key size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Password</p>
                                        <p className="text-xs text-slate-500">Request password reset email</p>
                                    </div>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={handlePasswordReset}>
                                    Change Password
                                </Button>
                            </div>
                            
                            <div className="my-4 h-px w-full bg-slate-200/50" />
                            
                            <div className="flex items-center justify-between opacity-60 grayscale">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                        <Smartphone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">2-Factor Authentication</p>
                                        <p className="text-xs text-slate-500">Add an extra layer of security</p>
                                    </div>
                                </div>
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                                    <span className="h-4 w-4 translate-x-1 transform rounded-full bg-white transition" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Danger Zone */}
                    <div className="space-y-6 pt-6 border-t border-slate-200/40">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 ring-1 ring-red-100 shadow-sm">
                                 <AlertTriangle size={16} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-lg font-semibold text-slate-900">Danger Zone</h3>
                        </div>

                        <div className="rounded-3xl border border-red-100 bg-red-50/30 p-6">
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Delete Account</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm">
                                        Permanently delete your account and all of your content. This action cannot be undone.
                                    </p>
                                </div>
                                <Button type="button" variant="danger" size="sm" className="whitespace-nowrap" onClick={() => setErrorMessage("Account deletion requires administrative authorization.")}>
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Delete Account
                                </Button>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-white/60 bg-white/70 px-8 py-5 backdrop-blur-xl">
                    <button 
                        type="button" 
                        onClick={handleSignOut}
                        className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors"
                    >
                        Sign Out
                    </button>
                    <div className="flex gap-4">
                         <Button type="button" variant="ghost" onClick={() => navigate(RoutePath.HOME)}>
                             Cancel
                         </Button>
                         <Button type="submit" isLoading={loading} className="shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)]">
                             <Save className="mr-2 h-4 w-4" />
                             Save Changes
                         </Button>
                    </div>
                </div>

            </form>
        </div>
    </div>
  );
};