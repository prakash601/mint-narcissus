import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '@/store/authSlice';
import { fetchMyRequests, fetchIncomingRequests } from '@/store/rentalSlice';
import StarRating from '@/components/settings/StarRatings';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Field, FieldGroup } from '@/components/ui/field';
import { LuMail, LuRuler, LuUser } from '@/utils/icons';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myRequests, incomingRequests } = useSelector((state) => state.rental);

  const [sizes, setSizes] = useState(() => ({
    height: user?.size?.height || '',
    fitType: user?.size?.fitType || '',
    topSize: user?.size?.topSize || '',
    bottomSize: user?.size?.bottomSize || '',
  }));
  const [saving, setSaving] = useState(false);

  const isLender = user?.activeRole === 'lender';

  useEffect(() => {
    if (isLender) {
      dispatch(fetchIncomingRequests({ page: 1, limit: 50 }));
    } else {
      dispatch(fetchMyRequests({ page: 1, limit: 50 }));
    }
  }, [dispatch, isLender]);

  const requests = isLender ? incomingRequests : myRequests;
  const activeLoans = requests.filter((r) => r.status === 'borrowed').length;
  const completed = requests.filter((r) => ['returned', 'rated'].includes(r.status)).length;

  const handleSizeChange = (key) => (value) => {
    setSizes((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateUser({ size: sizes })).unwrap();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className='grow container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto space-y-6'>
        <div>
          <h2 className='font-serif text-app-primary text-3xl font-bold'>
            Settings
          </h2>
          <p className='text-muted-foreground'>
            Manage your account and preferences
          </p>
        </div>
        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl leading-none text-app-primary font-serif'>
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col md:flex-row gap-6'>
              <div className='flex items-center space-x-4 flex-1'>
                <Avatar className='size-20'>
                  <AvatarImage src={user?.profilePhoto} alt={user?.name} />
                  <AvatarFallback className='capitalize text-2xl font-medium'>
                    {user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <h3 className='font-serif text-xl font-semibold'>
                    {user?.name}
                  </h3>
                  <p className='text-sm text-muted-foreground'>{user?.email}</p>
                  <div className='flex flex-wrap items-center gap-2 mt-2'>
                    <Badge variant='outline' className='capitalize rounded-sm'>
                      {user?.activeRole}
                    </Badge>
                    {user?.bio && (
                      <p className='text-xs text-muted-foreground w-full line-clamp-2'>
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className='border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <StarRating rating={user?.averageRating ?? 0} size={18} />
                    <span className='text-sm font-semibold'>
                      {(user?.averageRating ?? 0).toFixed(1)}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      ({user?.totalRatings ?? 0}{' '}
                      {user?.totalRatings === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div className='text-center p-2 bg-blue-50 rounded-md'>
                      <p className='text-lg font-bold text-blue-700'>{activeLoans}</p>
                      <p className='text-xs text-blue-600'>
                        {isLender ? 'On loan' : 'Active borrows'}
                      </p>
                    </div>
                    <div className='text-center p-2 bg-emerald-50 rounded-md'>
                      <p className='text-lg font-bold text-emerald-700'>{completed}</p>
                      <p className='text-xs text-emerald-600'>Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className='leading-none text-xl font-serif'>
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className='space-y-6'
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>
                    <LuUser />
                    Full Name
                  </Label>
                  <Input
                    id='name'
                    placeholder='Your name'
                    value={user?.name || ''}
                    disabled
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='email'>
                    <LuMail />
                    Email
                  </Label>
                  <Input
                    id='email'
                    placeholder='you@example.com'
                    value={user?.email || ''}
                    disabled
                  />
                  <p className='text-xs text-muted-foreground'>
                    Email cannot be changed
                  </p>
                </div>
              </div>
              <Separator />
              <div className='space-y-4'>
                <div>
                  <h3 className='text-lg font-semibold flex items-center font-serif'>
                    <LuRuler className='size-5 mr-2' /> Size Information
                  </h3>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Help us show you relevant outfits
                  </p>
                  <FieldGroup className='grid grid-cols-2 px-3 gap-3 mt-3'>
                    {/* HEIGHT */}
                    <Field>
                      <Label htmlFor='height'>Height</Label>
                      <Select
                        value={sizes.height}
                        onValueChange={handleSizeChange('height')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Height' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Short'>5'4–5'7</SelectItem>
                          <SelectItem value='Regular'>5'8–5'11</SelectItem>
                          <SelectItem value='Tall'>6'0+ </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    {/* FIT PREFERENCE */}
                    <Field>
                      <Label htmlFor='fitType'>Fit Preference</Label>
                      <Select
                        value={sizes.fitType}
                        onValueChange={handleSizeChange('fitType')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Fit Type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Slim'>Slim</SelectItem>
                          <SelectItem value='Regular'>Regular</SelectItem>
                          <SelectItem value='Relaxed'>Relaxed</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    {/* TOP SIZE */}
                    <Field>
                      <Label htmlFor='topSize'>Top Size</Label>
                      <Select
                        value={sizes.topSize}
                        onValueChange={handleSizeChange('topSize')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Top Size' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='S'>S</SelectItem>
                          <SelectItem value='M'>M</SelectItem>
                          <SelectItem value='L'>L</SelectItem>
                          <SelectItem value='XL'>XL</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    {/* BOTTOM SIZE */}
                    <Field>
                      <Label htmlFor='bottomSize'>Bottom Size</Label>
                      <Select
                        value={sizes.bottomSize}
                        onValueChange={handleSizeChange('bottomSize')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Bottom Size' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='28'>28</SelectItem>
                          <SelectItem value='30'>30</SelectItem>
                          <SelectItem value='32'>32</SelectItem>
                          <SelectItem value='34'>34</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                </div>
                <Separator />
                <div className='flex justify-end'>
                  <Button
                    type='submit'
                    className='bg-app-primary/90 hover:bg-app-primary/95 focus:bg-app-primary'
                    disabled={saving}
                  >
                    {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        {/* Account & Community Standing Card */}
        <Card>
          <CardHeader>
            <CardTitle className='text-xl font-serif leading-none'>
              Account & Community Standing
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Account Type</span>
              <span className='font-medium capitalize'>{user?.activeRole}</span>
            </div>
            <Separator />
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Profile Status</span>
              <span className='font-medium'>
                <Badge
                  variant={`${user?.isProfileComplete ? 'default' : 'destructive'}`}
                  className={`rounded-sm ${user?.isProfileComplete ? 'bg-app-primary' : ''}`}
                >
                  {user?.isProfileComplete ? 'Complete' : 'Incomplete'}
                </Badge>
              </span>
            </div>
            <Separator />
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Community Rating</span>
              <div className='flex items-center gap-1.5'>
                <StarRating rating={user?.averageRating ?? 0} size={14} />
                <span className='font-medium'>
                  {(user?.averageRating ?? 0).toFixed(1)} / 5.0
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Settings;
