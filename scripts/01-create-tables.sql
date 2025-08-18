-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create boards table
CREATE TABLE IF NOT EXISTS public.boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Board',
  description TEXT,
  thumbnail_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create board_elements table for whiteboard content
CREATE TABLE IF NOT EXISTS public.board_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('path', 'rectangle', 'circle', 'line', 'text', 'sticky_note')),
  data JSONB NOT NULL,
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  width REAL,
  height REAL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create board_collaborators table for team access
CREATE TABLE IF NOT EXISTS public.board_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_collaborators ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for boards
CREATE POLICY "Users can view boards they own or collaborate on" ON public.boards
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    is_public = TRUE OR
    id IN (
      SELECT board_id FROM public.board_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create boards" ON public.boards
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own boards" ON public.boards
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own boards" ON public.boards
  FOR DELETE USING (owner_id = auth.uid());

-- Create policies for board_elements
CREATE POLICY "Users can view elements of accessible boards" ON public.board_elements
  FOR SELECT USING (
    board_id IN (
      SELECT id FROM public.boards 
      WHERE owner_id = auth.uid() OR is_public = TRUE OR
      id IN (SELECT board_id FROM public.board_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create elements in accessible boards" ON public.board_elements
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT id FROM public.boards 
      WHERE owner_id = auth.uid() OR
      id IN (SELECT board_id FROM public.board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

CREATE POLICY "Users can update elements in accessible boards" ON public.board_elements
  FOR UPDATE USING (
    board_id IN (
      SELECT id FROM public.boards 
      WHERE owner_id = auth.uid() OR
      id IN (SELECT board_id FROM public.board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

CREATE POLICY "Users can delete elements in accessible boards" ON public.board_elements
  FOR DELETE USING (
    board_id IN (
      SELECT id FROM public.boards 
      WHERE owner_id = auth.uid() OR
      id IN (SELECT board_id FROM public.board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- Create policies for board_collaborators
CREATE POLICY "Users can view collaborators of their boards" ON public.board_collaborators
  FOR SELECT USING (
    board_id IN (
      SELECT id FROM public.boards WHERE owner_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Board owners can manage collaborators" ON public.board_collaborators
  FOR ALL USING (
    board_id IN (
      SELECT id FROM public.boards WHERE owner_id = auth.uid()
    )
  );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
