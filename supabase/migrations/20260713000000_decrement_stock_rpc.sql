-- Function to decrement stock atomically on payment success
create or replace function public.decrement_stock(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity int
)
returns void as $$
begin
  -- If variant_id is provided, decrement variant stock, else decrement product base stock
  if p_variant_id is not null then
    update public.product_variants
    set stock_quantity = greatest(0, stock_quantity - p_quantity)
    where id = p_variant_id;
  else
    update public.products
    set stock_quantity = greatest(0, stock_quantity - p_quantity)
    where id = p_product_id;
  end if;
end;
$$ language plpgsql security definer;
