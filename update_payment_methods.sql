-- Update sales table payment_method check constraint to include 'CONSUMO_INTERNO'
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_payment_method_check;

ALTER TABLE sales 
  ADD CONSTRAINT sales_payment_method_check 
  CHECK (payment_method IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CONSUMO_INTERNO'));
