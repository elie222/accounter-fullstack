# use this commands to migrate DB to account_id-based logic:



```
ALTER TABLE accounter_schema.all_transactions ALTER COLUMN account_number DROP NOT NULL;

UPDATE accounter_schema.all_transactions SET account_number=null WHERE TRUE;

ALTER TABLE accounter_schema.all_transactions ALTER COLUMN account_number SET DATA TYPE UUID;

ALTER TABLE accounter_schema.all_transactions  RENAME COLUMN account_number TO account_id;

update accounter_schema.all_transactions set account_id=ac.account_id
from (
    select ict.card, fa.account_number, ict.id, fa.id as account_id
    from accounter_schema.isracard_creditcard_transactions ict
    left join accounter_schema.financial_accounts fa
    on fa.account_number=ict.card
) ac where original_id= ac.id;

update accounter_schema.all_transactions set account_id=ac.account_id
from (
    select pils.account_number, fa.account_number, pils.id, fa.id as account_id
    from accounter_schema.poalim_ils_account_transactions pils
    left join accounter_schema.financial_accounts fa
    on fa.account_number=pils.account_number and fa.branch_number=pils.branch_number
) ac where original_id= ac.id;

update accounter_schema.all_transactions set account_id=ac.account_id
from (
    select pils.account_number, fa.account_number, pils.id, fa.id as account_id
    from accounter_schema.poalim_usd_account_transactions pils
    left join accounter_schema.financial_accounts fa
    on fa.account_number=pils.account_number and fa.branch_number=pils.branch_number
) ac where original_id= ac.id;

update accounter_schema.all_transactions set account_id=ac.account_id
from (
    select pils.account_number, fa.account_number, pils.id, fa.id as account_id
    from accounter_schema.poalim_gbp_account_transactions pils
    left join accounter_schema.financial_accounts fa
    on fa.account_number=pils.account_number and fa.branch_number=pils.branch_number
) ac where original_id= ac.id;

update accounter_schema.all_transactions set account_id=ac.account_id
from (
    select pils.account_number, fa.account_number, pils.id, fa.id as account_id
    from accounter_schema.poalim_eur_account_transactions pils
    left join accounter_schema.financial_accounts fa
    on fa.account_number=pils.account_number and fa.branch_number=pils.branch_number
) ac where original_id= ac.id;

ALTER TABLE accounter_schema.all_transactions ALTER COLUMN account_id SET NOT NULL;

alter table accounter_schema.all_transactions
	add constraint all_transactions_financial_accounts_id_fk
		foreign key (account_id) references accounter_schema.financial_accounts;
```