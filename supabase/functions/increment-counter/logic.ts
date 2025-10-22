// Increment counter logic - demonstrates database integration
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export interface CounterResult {
  count: number;
  timestamp: string;
}

export class CounterError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'CounterError';
  }
}

/**
 * Increment the voice counter in the database
 */
export async function incrementCounter(): Promise<CounterResult> {
  // Get Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new CounterError(
      'Supabase configuration missing',
      'SUPABASE_NOT_CONFIGURED',
      500
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get the current counter (should only be one row)
    const { data: counterData, error: fetchError } = await supabase
      .from('voice_counter')
      .select('id, count')
      .limit(1)
      .single();

    if (fetchError) {
      throw new CounterError(
        `Failed to fetch counter: ${fetchError.message}`,
        'FETCH_ERROR',
        500
      );
    }

    if (!counterData) {
      throw new CounterError(
        'Counter not initialized in database',
        'COUNTER_NOT_FOUND',
        404
      );
    }

    // Increment the counter
    const newCount = counterData.count + 1;
    const { error: updateError } = await supabase
      .from('voice_counter')
      .update({
        count: newCount,
        last_called_at: new Date().toISOString(),
      })
      .eq('id', counterData.id);

    if (updateError) {
      throw new CounterError(
        `Failed to update counter: ${updateError.message}`,
        'UPDATE_ERROR',
        500
      );
    }

    return {
      count: newCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof CounterError) {
      throw error;
    }
    throw new CounterError(
      `Database error: ${error instanceof Error ? error.message : String(error)}`,
      'DATABASE_ERROR',
      500
    );
  }
}
