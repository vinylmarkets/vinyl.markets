-- Create prediction_results table to store actual vs predicted outcomes (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'prediction_results') THEN
        CREATE TABLE public.prediction_results (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            prediction_id UUID NOT NULL UNIQUE,
            symbol TEXT NOT NULL,
            prediction_date DATE NOT NULL,
            predicted_high NUMERIC NOT NULL,
            predicted_low NUMERIC NOT NULL,
            predicted_close NUMERIC NOT NULL,
            actual_high NUMERIC,
            actual_low NUMERIC,
            actual_close NUMERIC,
            actual_volume BIGINT,
            high_accuracy NUMERIC, -- Percentage accuracy for high prediction
            low_accuracy NUMERIC, -- Percentage accuracy for low prediction  
            close_accuracy NUMERIC, -- Percentage accuracy for close prediction
            direction_correct BOOLEAN, -- Whether direction was predicted correctly
            confidence_score INTEGER, -- Original confidence score
            rank INTEGER, -- Original prediction rank
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Enable RLS on prediction_results
        ALTER TABLE public.prediction_results ENABLE ROW LEVEL SECURITY;
        
        -- Create indexes for faster queries
        CREATE INDEX idx_prediction_results_date ON public.prediction_results(prediction_date);
        CREATE INDEX idx_prediction_results_symbol ON public.prediction_results(symbol);

        -- Create trigger for updated_at
        CREATE TRIGGER update_prediction_results_updated_at
        BEFORE UPDATE ON public.prediction_results
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'prediction_results' 
        AND policyname = 'Admins can manage prediction results'
    ) THEN
        CREATE POLICY "Admins can manage prediction results" 
        ON public.prediction_results 
        FOR ALL 
        USING (EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'prediction_results' 
        AND policyname = 'Anyone can view prediction results'
    ) THEN
        CREATE POLICY "Anyone can view prediction results" 
        ON public.prediction_results 
        FOR SELECT 
        USING (true);
    END IF;
END $$;