-- Transaction Management Functions
create or replace function begin_transaction()
returns void
language plpgsql
security definer
as $$
begin
  execute 'begin';
end;
$$;

create or replace function commit_transaction()
returns void
language plpgsql
security definer
as $$
begin
  execute 'commit';
end;
$$;

create or replace function rollback_transaction()
returns void
language plpgsql
security definer
as $$
begin
  execute 'rollback';
end;
$$;

-- Grant execute permissions
grant execute on function begin_transaction to authenticated;
grant execute on function commit_transaction to authenticated;
grant execute on function rollback_transaction to authenticated;
