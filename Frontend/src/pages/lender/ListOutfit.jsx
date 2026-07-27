import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SizeGuideModal from '@/components/shared/SizeGuideModal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createItem } from '@/store/itemsSlice';
import { Loader2 } from 'lucide-react';

const interviewTypesMap = [
  'Tech',
  'Corporate',
  'Finance',
  'Creative',
  'Healthcare',
  'Retail',
  'Others',
];

const ListOutfit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { status } = useSelector((state) => state.items);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [interviewTypes, setInterviewTypes] = useState([]);
  const [fabricType, setFabricType] = useState('');
  const [height, setHeight] = useState(user?.size?.height || '');
  const [fitType, setFitType] = useState(user?.size?.fitType || '');
  const [topSize, setTopSize] = useState(user?.size?.topSize || '');
  const [bottomSize, setBottomSize] = useState(user?.size?.bottomSize || '');
  const [confidenceNote, setConfidenceNote] = useState('');

  const handleCancel = () => navigate('/lender/my-outfits');
  const handleListOutfit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('outfitImageUrl', imageUrl);
    formData.append('category', category);
    formData.append('interviewTypes', JSON.stringify(interviewTypes));
    formData.append('fabricType', fabricType);
    formData.append('size', JSON.stringify({ height, fitType, topSize, bottomSize }));
    formData.append('confidenceNote', confidenceNote);
    formData.append('lenderDetails', JSON.stringify({
      lenderId: user.id,
      lenderName: user.name,
    }));

    try {
      await dispatch(createItem(formData)).unwrap();
      toast.success('Outfit listed successfully!');
      navigate('/lender/my-outfits');
    } catch (err) {
      toast.error(err || 'Failed to list outfit');
    }
  };

  const isValid =
    title &&
    description &&
    imageUrl &&
    category &&
    interviewTypes.length > 0 &&
    fabricType &&
    height &&
    topSize &&
    bottomSize &&
    fitType;

  return (
    <section className='grow container mx-auto px-4 py-8'>
      <div className='max-w-2xl mx-auto'>
        <Card className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border'>
          <CardHeader>
            <CardTitle className='font-serif text-app-primary text-xl'>
              List a New Outfit
            </CardTitle>
            <CardDescription>
              Share your professional outfit with job seekers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className='space-y-6' onSubmit={handleListOutfit}>
              {/* TITLE */}
              <Field>
                <Label htmlFor='title'>Outfit Title *</Label>
                <Input
                  id='title'
                  type='text'
                  placeholder='e.g., Classic Navy Suit'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
              </Field>
              {/* DESCRIPTION */}
              <Field>
                <Label htmlFor='description'>Description *</Label>
                <Textarea
                  id='description'
                  placeholder='Describe the outfit, its features, and condition...'
                  rows={4}
                  className='resize-none'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
              </Field>
              {/* OUTFIT IMAGE URL */}
              <Field>
                <Label htmlFor='imageUrl'>Image URL *</Label>
                <Input
                  id='imageUrl'
                  type='url'
                  placeholder='https://example.com/outfit.jpg'
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
                <p className='text-muted-foreground text-xs'>
                  Paste a URL to an image of your outfit
                </p>
              </Field>
              {/* CATEGORY */}
              <Field>
                <Label htmlFor='category'>Category *</Label>
                <Select value={category} onValueChange={setCategory} disabled={status === 'loading'}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Category</SelectLabel>
                      <SelectItem value='Formal'>Formal</SelectItem>
                      <SelectItem value='Semi-Formal'>Semi-Formal</SelectItem>
                      <SelectItem value='Business-Casual'>
                        Business-Casual
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              {/* INTERVIEW TYPES */}
              <Field>
                <Label>Suitable for Interview Types *</Label>
                <FieldGroup className='grid grid-cols-3 px-3 gap-1'>
                  {interviewTypesMap.map((type) => (
                    <Field key={type} orientation='horizontal'>
                      <Checkbox
                        id={type}
                        name={type}
                        checked={interviewTypes.includes(type)}
                        onCheckedChange={(checked) =>
                          setInterviewTypes(
                            checked
                              ? [...interviewTypes, type]
                              : interviewTypes.filter((i) => i !== type),
                          )
                        }
                        disabled={status === 'loading'}
                      />
                      <FieldLabel htmlFor={type}>{type}</FieldLabel>
                    </Field>
                  ))}
                </FieldGroup>
              </Field>
              {/* FABRIC */}
              <Field>
                <Label htmlFor='fabricType'>Fabric Type *</Label>
                <Input
                  id='fabricType'
                  type='text'
                  placeholder='e.g., Wool, Cotton, Polyester blend'
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
              </Field>
              {/* SIZE */}
              <Field>
                <Label className='flex justify-between'>
                  <span className='flex-1'>Size Information *</span>
                  <SizeGuideModal />
                </Label>
                <FieldGroup className='grid grid-cols-2 px-3 gap-3'>
                  {/* HEIGHT */}
                  <Field>
                    <Label htmlFor='height'>Height</Label>
                    <Select value={height} onValueChange={setHeight} disabled={status === 'loading'}>
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
                    <Select value={fitType} onValueChange={setFitType} disabled={status === 'loading'}>
                      <SelectTrigger>
                        <SelectValue placeholder='Fit Preference' />
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
                    <Select value={topSize} onValueChange={setTopSize} disabled={status === 'loading'}>
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
                    <Select value={bottomSize} onValueChange={setBottomSize} disabled={status === 'loading'}>
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
              </Field>
              {/* CONFIDENCE NOTE */}
              <Field>
                <Label htmlFor='confidenceNote'>
                  Confidence Note (Optional)
                </Label>
                <Textarea
                  id='confidenceNote'
                  placeholder='Share an encouraging message or success story...'
                  rows={4}
                  className='resize-none'
                  value={confidenceNote}
                  onChange={(e) => setConfidenceNote(e.target.value)}
                  disabled={status === 'loading'}
                />
                <p className='text-xs text-muted-foreground'>
                  A personal message to inspire the borrower
                </p>
              </Field>
              {/* BUTTONS */}
              <div className='grid grid-cols-2 gap-2'>
                <Button variant='outline' type='button' onClick={handleCancel} disabled={status === 'loading'}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='bg-app-primary/95 hover:bg-app-primary'
                  disabled={status === 'loading' || !isValid}
                >
                  {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {status === 'loading' ? 'Loading...' : 'List Outfit'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ListOutfit;