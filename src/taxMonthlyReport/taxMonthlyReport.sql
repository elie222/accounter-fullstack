select
       *,
       gen_random_uuid() as id,
       false as reviewed
-- into table accounter_schema.saved_tax_reports_2020_03
from get_tax_report_of_month('2020-03-01');

select
       *,
       gen_random_uuid() as id,
       false as reviewed
-- into table accounter_schema.saved_tax_reports_2020_01
from get_tax_report_of_month('2020-01-01')
order by to_date(תאריך_3, 'DD/MM/YYYY'), original_id;

SELECT count(CASE WHEN t3.reviewed THEN 1 END) FROM (
select
       *,
       gen_random_uuid() as id,
       (
           select t1.reviewed
           from accounter_schema.saved_tax_reports_2020_03_old2 t1
           where
                coalesce(t1.תאריך_3, '') = coalesce(t2.תאריך_3, '') and
                coalesce(t1.אסמכתא_1, 0) = coalesce(t2.אסמכתא_1, 0) and
                coalesce(t1.אסמכתא_2, '') = coalesce(t2.אסמכתא_2, '') and
                coalesce(t1.חשבון_זכות_1, '') = coalesce(t2.חשבון_זכות_1, '') and
                coalesce(t1.חשבון_חובה_1, '') = coalesce(t2.חשבון_חובה_1, '') and
                coalesce(t1.מטח_סכום_זכות_1, '' )= coalesce(t2.מטח_סכום_זכות_1, '') and
                coalesce(t1.מטח_סכום_חובה_1, '') = coalesce(t2.מטח_סכום_חובה_1, '') and
                coalesce(t1.חשבון_זכות_2, '') = coalesce(t2.חשבון_זכות_2, '') and
                coalesce(t1.חשבון_חובה_2, '' )= coalesce(t2.חשבון_חובה_2, '') and
                coalesce(t1.מטבע, '') = coalesce(t2.מטבע, '') and
                coalesce(t1.מטח_סכום_זכות_2, '') = coalesce(t2.מטח_סכום_זכות_2, '') and
                coalesce(t1.מטח_סכום_חובה_2, '') = coalesce(t2.מטח_סכום_חובה_2, '') and
                coalesce(t1.סוג_תנועה, '') = coalesce(t2.סוג_תנועה, '')
       ) as reviewed
from get_tax_report_of_month('2020-03-01') t2
order by to_date(תאריך_3, 'DD/MM/YYYY'), original_id) t3;


select
       *,
       gen_random_uuid() as id,
       (
           select t1.reviewed
           from accounter_schema.saved_tax_reports_2020_03_old t1
           where
                coalesce(t1.תאריך_3, '') = coalesce(t2.תאריך_3, '') and
                coalesce(t1.אסמכתא_1, 0) = coalesce(t2.אסמכתא_1, 0) and
                coalesce(t1.אסמכתא_2, '') = coalesce(t2.אסמכתא_2, '') and
                coalesce(t1.חשבון_זכות_1, '') = coalesce(t2.חשבון_זכות_1, '') and
                coalesce(t1.חשבון_חובה_1, '') = coalesce(t2.חשבון_חובה_1, '') and
                coalesce(t1.מטח_סכום_זכות_1, '' )= coalesce(t2.מטח_סכום_זכות_1, '') and
                coalesce(t1.מטח_סכום_חובה_1, '') = coalesce(t2.מטח_סכום_חובה_1, '') and
                coalesce(t1.חשבון_זכות_2, '') = coalesce(t2.חשבון_זכות_2, '') and
                coalesce(t1.חשבון_חובה_2, '' )= coalesce(t2.חשבון_חובה_2, '') and
                coalesce(t1.מטבע, '') = coalesce(t2.מטבע, '') and
                coalesce(t1.מטח_סכום_זכות_2, '') = coalesce(t2.מטח_סכום_זכות_2, '') and
                coalesce(t1.מטח_סכום_חובה_2, '') = coalesce(t2.מטח_סכום_חובה_2, '') and
                coalesce(t1.סוג_תנועה, '') = coalesce(t2.סוג_תנועה, '')
       ) as reviewed
into table accounter_schema.saved_tax_reports_2020_0333
from get_tax_report_of_month('2020-03-01') t2
order by to_date(תאריך_3, 'DD/MM/YYYY'), original_id;

select *
from get_unified_tax_report_of_month('2020-03-01')
order by to_date(תאריך_3, 'DD/MM/YYYY'), original_id, פרטים;

CREATE OR REPLACE FUNCTION get_unified_tax_report_of_month(month_input varchar)
RETURNS TABLE(
       תאריך_חשבונית varchar,
       חשבון_חובה_1 varchar,
       סכום_חובה_1 varchar,
       מטח_סכום_חובה_1 varchar,
       מטבע varchar,
       חשבון_זכות_1 varchar,
       סכום_זכות_1 varchar,
       מטח_סכום_זכות_1 varchar,
       חשבון_חובה_2 varchar,
       סכום_חובה_2 varchar,
       מטח_סכום_חובה_2 varchar,
       חשבון_זכות_2 varchar,
       סכום_זכות_2 varchar,
       מטח_סכום_זכות_2 varchar,
       פרטים varchar,
       אסמכתא_1 int,
       אסמכתא_2 varchar,
       סוג_תנועה varchar,
       תאריך_ערך varchar,
       תאריך_3 varchar,
       original_id text,
       id uuid,
       reviewed boolean
)
LANGUAGE SQL
AS $$


select * from accounter_schema.saved_tax_reports_2020_0333
UNION ALL
select
       formatted_event_date as תאריך_חשבונית,
       CONCAT('BANK ', formatted_account) as חשבון_חובה_1,
       event_amount::text as סכום_חובה_1,
       bank_description as מטח_סכום_חובה_1,
       currency_code as מטבע,
       formatted_financial_entity as חשבון_זכות_1,
       tax_category as סכום_זכות_1,
       'BANK' as מטח_סכום_זכות_1,
       'BANK' as חשבון_חובה_2,
       'BANK' as סכום_חובה_2,
       'BANK' as מטח_סכום_חובה_2,
       'BANK' as חשבון_זכות_2,
       (select all_exchange_dates.usd_rate
        from all_exchange_dates
        where all_exchange_dates.exchange_date = debit_date::text::date)::text as סכום_זכות_2,
       (select all_exchange_dates.eur_rate
        from all_exchange_dates
        where all_exchange_dates.exchange_date = debit_date::text::date)::text as מטח_סכום_זכות_2,
       '0' as פרטים,
       bank_reference as אסמכתא_1,
       to_char(tax_invoice_date, 'DD/MM/YYYY') as אסמכתא_2,
       vat::text as סוג_תנועה,
       to_char(debit_date, 'DD/MM/YYYY') as תאריך_ערך,
       formatted_event_date as תאריך_3,
       id::text as original_id,
       id as id,
       false as reviewed
from formatted_merged_tables
where
    business_trip IS NULL AND
    (account_number = 2733 OR account_number = 61066) AND
        (((financial_entity != 'Isracard' OR financial_entity IS NULL) AND
            account_type != 'creditcard' AND
            event_date::text::date >= date_trunc('month', month_input::date) AND
            event_date::text::date <= (date_trunc('month', month_input::date) + interval '1 month' - interval '1 day')::date OR
            event_date IS NULL)
        OR (
            (account_type = 'creditcard' OR financial_entity = 'Isracard') AND
             (
                   debit_date::text::date <= get_creditcard_charge_date(month_input)::date AND debit_date::text::date > get_creditcard_charge_date_former_month(month_input)::date OR
                   (debit_date IS NULL AND event_date::text::date >= date_trunc('month', month_input::date) AND
                    event_date::text::date <= (date_trunc('month', month_input::date) + interval '1 month' - interval '1 day')::date)
             )))

$$;


drop function get_tax_report_of_month(month_input varchar);

CREATE OR REPLACE FUNCTION get_tax_report_of_month(month_input varchar)
RETURNS TABLE(
       תאריך_חשבונית varchar,
       חשבון_חובה_1 varchar,
       סכום_חובה_1 varchar,
       מטח_סכום_חובה_1 varchar,
       מטבע varchar,
       חשבון_זכות_1 varchar,
       סכום_זכות_1 varchar,
       מטח_סכום_זכות_1 varchar,
       חשבון_חובה_2 varchar,
       סכום_חובה_2 varchar,
       מטח_סכום_חובה_2 varchar,
       חשבון_זכות_2 varchar,
       סכום_זכות_2 varchar,
       מטח_סכום_זכות_2 varchar,
       פרטים varchar,
       אסמכתא_1 int,
       אסמכתא_2 varchar,
       סוג_תנועה varchar,
       תאריך_ערך varchar,
       תאריך_3 varchar,
       original_id text
)
LANGUAGE SQL
AS $$



WITH this_month_business AS (
SELECT *
FROM formatted_merged_tables
WHERE
    business_trip IS NULL AND
    (account_number = 2733 OR account_number = 61066) AND
        (((financial_entity != 'Isracard' OR financial_entity IS NULL) AND
            account_type != 'creditcard' AND
            event_date::text::date >= date_trunc('month', month_input::date) AND
            event_date::text::date <= (date_trunc('month', month_input::date) + interval '1 month' - interval '1 day')::date OR
            event_date IS NULL)
        OR (
            (account_type = 'creditcard' OR financial_entity = 'Isracard') AND
             (
                   debit_date::text::date <= get_creditcard_charge_date(month_input)::date AND debit_date::text::date > get_creditcard_charge_date_former_month(month_input)::date OR
                   (debit_date IS NULL AND event_date::text::date >= date_trunc('month', month_input::date) AND
                    event_date::text::date <= (date_trunc('month', month_input::date) + interval '1 month' - interval '1 day')::date)
             )))
), full_report_selection as (
    SELECT
        (CASE
            WHEN side = 0 THEN
                (CASE
                    WHEN (financial_entity = 'Poalim' OR financial_entity = 'Isracard')
                        THEN formatted_event_date
                    ELSE formatted_tax_invoice_date
                END)
            ELSE
                formatted_event_date
        END) AS תאריך_חשבונית,
        (CASE WHEN event_amount < 0 THEN
            (CASE WHEN side = 0 THEN
                tax_category
                ELSE formatted_financial_entity
            END) ELSE
            (CASE WHEN side = 0 THEN
                formatted_financial_entity
                ELSE formatted_account
            END)
        END) AS חשבון_חובה_1,
        (CASE WHEN event_amount < 0 THEN
            (CASE
                WHEN side = 0 THEN formatted_invoice_amount_in_ils_if_exists
                ELSE formatted_event_amount_in_ils
            END) ELSE
            (CASE
                WHEN side = 0 THEN formatted_invoice_amount_in_ils_with_vat_if_exists
                ELSE formatted_event_amount_in_ils
            END)
        END) AS סכום_חובה_1,
        (CASE
            WHEN side = 0 THEN formatted_invoice_foreign_amount_if_exist
            ELSE formatted_foreign_amount_if_exist
        END) AS מטח_סכום_חובה_1,
        formatted_currency AS מטבע,
        (CASE WHEN event_amount < 0 THEN
           (CASE
              WHEN side = 0 THEN formatted_financial_entity
              ELSE formatted_account
           END) ELSE
           (CASE
               WHEN side = 0 THEN tax_category
               ELSE formatted_financial_entity
           END)
        END) AS חשבון_זכות_1,
        (CASE WHEN event_amount > 0 THEN
            (CASE
                WHEN side = 0 THEN formatted_invoice_amount_in_ils_if_exists
                ELSE formatted_event_amount_in_ils
            END) ELSE
            (CASE
                WHEN side = 0 THEN formatted_invoice_amount_in_ils_if_exists
                ELSE formatted_event_amount_in_ils
            END)
        END) AS סכום_זכות_1,
        (CASE
            WHEN side = 0 THEN formatted_invoice_foreign_amount_if_exist
            ELSE formatted_foreign_amount_if_exist
        END) AS מטח_סכום_זכות_1,
        (CASE
            WHEN (side = 0 AND event_amount < 0 AND vat <> 0) THEN 'תשו'
--             ELSE NULL
            END
        ) AS חשבון_חובה_2,
         (CASE
            WHEN (side = 0 AND event_amount < 0) THEN (CASE WHEN vat <> 0 THEN to_char(float8 (ABS(
                (case when tax_category = 'פלאפון' then ((vat::float/3)*2)
                else vat
                end)
                )), 'FM999999999.00') END)

--             ELSE NULL
         END) AS סכום_חובה_2,
        '' AS מטח_סכום_חובה_2,
        (CASE
            WHEN (side = 0 AND event_amount > 0 AND vat <> 0) THEN 'עסק'
--             ELSE NULL
            END
        ) AS חשבון_זכות_2,
        (CASE
            WHEN (side = 0 AND event_amount > 0) THEN (CASE WHEN vat <> 0 THEN to_char(float8 (ABS(vat)), 'FM999999999.00') END)
--             ELSE NULL
         END) AS סכום_זכות_2,
        '' AS מטח_סכום_זכות_2,
        user_description AS פרטים,
        bank_reference AS אסמכתא_1,
        LEFT(regexp_replace(tax_invoice_number, '[^0-9]+', '', 'g'), 9) AS אסמכתא_2,
        (CASE
            WHEN side = 0 THEN
                (CASE WHEN event_amount < 0 THEN
                    (CASE
                        WHEN currency_code = 'ILS' THEN
                            (CASE
                                WHEN financial_entity = 'Hot Mobile' THEN 'פלא'
                                WHEN vat <> 0 THEN 'חס'
                                ELSE NULL
                            END)
                        ELSE ''
                    END)
                ELSE
                    (CASE
                        WHEN account_type = 'checking_ils' THEN 'חל'
                        ELSE 'הכפ'
                    END)
                END)
--             ELSE NULL
            END
        ) AS סוג_תנועה,
       (CASE
            WHEN debit_date IS NULL THEN formatted_event_date
            ELSE formatted_debit_date
        END) AS תאריך_ערך,
        formatted_event_date AS תאריך_3,
        formatted_invoice_amount_in_ils_if_exists,
        formatted_event_amount_in_ils,
        event_amount,
        account_type,
        vat,
        tax_invoice_date,
        financial_entity,
        side,
        is_conversion,
        tax_invoice_amount,
        currency_rate,
        personal_category,
        currency_code,
        contra_currency_code,
        debit_date,
        id
    FROM this_month_business, generate_series(0,1) as side /* 0 = Entities, 1 = Accounts */
), two_sides as (
    SELECT
        תאריך_חשבונית,
        חשבון_חובה_1,
        סכום_חובה_1,
        מטח_סכום_חובה_1,
        מטבע,
        חשבון_זכות_1,
        סכום_זכות_1,
        מטח_סכום_זכות_1,
        חשבון_חובה_2,
        סכום_חובה_2,
        מטח_סכום_חובה_2,
        חשבון_זכות_2,
        סכום_זכות_2,
        מטח_סכום_זכות_2,
        פרטים,
        אסמכתא_1,
        אסמכתא_2,
        סוג_תנועה,
        תאריך_ערך,
        תאריך_3,
        id::text as original_id
    FROM full_report_selection
    WHERE
        financial_entity != 'Isracard' AND
        financial_entity != 'Tax' AND
        financial_entity != 'VAT' AND
        financial_entity != 'Uri Goldshtein Employee Tax Withholding' AND
        financial_entity != 'Uri Goldshtein' AND
        financial_entity != 'Uri Goldshtein Employee Social Security' AND
        is_conversion <> TRUE
), one_side as (
    SELECT
        תאריך_חשבונית,
        חשבון_חובה_1,
        סכום_חובה_1,
        מטח_סכום_חובה_1,
        מטבע,
        חשבון_זכות_1,
        סכום_זכות_1,
        מטח_סכום_זכות_1,
        חשבון_חובה_2,
        סכום_חובה_2,
        מטח_סכום_חובה_2,
        חשבון_זכות_2,
        סכום_זכות_2,
        מטח_סכום_זכות_2,
        פרטים,
        אסמכתא_1,
        אסמכתא_2,
        סוג_תנועה,
        תאריך_ערך,
        תאריך_3,
        id::text as original_id
    FROM full_report_selection
    WHERE
       (financial_entity = 'Uri Goldshtein' OR
        financial_entity = 'Tax' OR
        financial_entity = 'VAT' OR
        financial_entity = 'Uri Goldshtein Employee Social Security' OR
        financial_entity = 'Isracard' OR
        financial_entity = 'Uri Goldshtein Employee Tax Withholding') AND
       side = 1
), conversions as (
    SELECT
        תאריך_חשבונית,
        (CASE WHEN event_amount > 0 THEN חשבון_חובה_1 END) as חשבון_חובה_1,
        (CASE WHEN event_amount > 0 THEN סכום_חובה_1 END) as סכום_חובה_1,
        (CASE WHEN event_amount > 0 THEN מטח_סכום_חובה_1 END) as מטח_סכום_חובה_1,
        מטבע,
        (CASE WHEN event_amount < 0 THEN חשבון_זכות_1 END) as חשבון_זכות_1,
        (CASE WHEN event_amount < 0 THEN סכום_זכות_1 END) as סכום_זכות_1,
        (CASE WHEN event_amount < 0 THEN מטח_סכום_זכות_1 END) as מטח_זכות_חובה_1,
        '' AS חשבון_חובה_2,
        '' AS סכום_חובה_2,
        '' AS מטח_סכום_חובה_2,
        '' AS חשבון_זכות_2,
        '' AS סכום_זכות_2,
        '' AS מטח_סכום_זכות_2,
        פרטים,
        אסמכתא_1,
        '' AS אסמכתא_2,
        '' AS סוג_תנועה,
        תאריך_ערך,
        תאריך_3,
        id::text as original_id
    FROM full_report_selection
    WHERE
         is_conversion IS TRUE AND
         side = 1
), conversions_fees as (
    SELECT
        תאריך_חשבונית,
        'הפרשי שער' as חשבון_חובה_1,
        to_char(float8 (CASE WHEN event_amount > 0 THEN
            ((
                select סכום_זכות_1
                from full_report_selection t1
                where
                    t1.is_conversion is true and
                    side = 1 and
                    אסמכתא_1 = t1.אסמכתא_1 and
                    t1.event_amount < 0
            )::float - סכום_חובה_1::float)
        END), 'FM999999999.00') as סכום_חובה_1,
        '' as מטח_סכום_חובה_1,
        '' as מטבע,
        '' as חשבון_זכות_1,
        '' as סכום_זכות_1,
        '' as מטח_זכות_חובה_1,
        '' AS חשבון_חובה_2,
        '' AS סכום_חובה_2,
        '' AS מטח_סכום_חובה_2,
        '' AS חשבון_זכות_2,
        '' AS סכום_זכות_2,
        '' AS מטח_סכום_זכות_2,
        פרטים,
        אסמכתא_1,
        '' AS אסמכתא_2,
        '' AS סוג_תנועה,
        תאריך_ערך,
        תאריך_3,
        id::text as original_id
    FROM full_report_selection
    WHERE
         is_conversion IS TRUE AND
         side = 1 and
         event_amount > 0
), invoice_rates_change as (
    SELECT
            תאריך_חשבונית AS תאריך_חשבונית,
            'הפרשי שער' AS חשבון_חובה_1,
            to_char(float8 (formatted_invoice_amount_in_ils_if_exists::float - formatted_event_amount_in_ils::float), 'FM999999999.00') AS סכום_חובה_1,
            '' AS מטח_סכום_חובה_1,
            '' AS מטבע,
            '' AS חשבון_זכות_1,
            '' AS סכום_זכות_1,
            '' AS מטח_סכום_זכות_1,
            '' AS חשבון_חובה_2,
            '' AS סכום_חובה_2,
            '' AS מטח_סכום_חובה_2,
            '' AS חשבון_זכות_2,
            '' AS סכום_זכות_2,
            '' AS מטח_סכום_זכות_2,
            פרטים AS פרטים,
            אסמכתא_1 AS אסמכתא_1,
            אסמכתא_2 AS אסמכתא_2,
            '' AS סוג_תנועה,
           תאריך_ערך AS תאריך_ערך,
           תאריך_3 AS תאריך_3,
           id::text as original_id
    FROM full_report_selection
    WHERE
         tax_invoice_date <> debit_date and
         account_type != 'creditcard' and
         currency_code != 'ILS' and
         side = 1 and
         (tax_invoice_amount is null or tax_invoice_amount = event_amount)
), transfer_fees as (
    SELECT
            formatted_event_date AS תאריך_חשבונית,
            'עמל' AS חשבון_חובה_1,
            to_char(float8 (CASE
                WHEN currency_code = 'EUR' THEN (ABS(tax_invoice_amount) - event_amount) * (
                    select all_exchange_dates.eur_rate
                    from all_exchange_dates
                    where all_exchange_dates.exchange_date = debit_date::text::date
                )
                WHEN currency_code = 'USD' THEN (ABS(tax_invoice_amount) - event_amount) * (
                    select all_exchange_dates.usd_rate
                    from all_exchange_dates
                    where all_exchange_dates.exchange_date = debit_date::text::date
                )
            END), 'FM999999999.00') AS סכום_חובה_1,
            to_char(float8 (ABS(tax_invoice_amount) - event_amount), 'FM999999999.00') AS מטח_סכום_חובה_1,
            formatted_currency AS מטבע,
            financial_entity AS חשבון_זכות_1,
            to_char(float8 (CASE
                WHEN currency_code = 'EUR' THEN (ABS(tax_invoice_amount) - event_amount) * (
                    select all_exchange_dates.eur_rate
                    from all_exchange_dates
                    where all_exchange_dates.exchange_date = debit_date::text::date
                )
                WHEN currency_code = 'USD' THEN (ABS(tax_invoice_amount) - event_amount) * (
                    select all_exchange_dates.usd_rate
                    from all_exchange_dates
                    where all_exchange_dates.exchange_date = debit_date::text::date
                )
            END), 'FM999999999.00') AS סכום_זכות_1,
            to_char(float8 (ABS(tax_invoice_amount) - event_amount), 'FM999999999.00') AS מטח_סכום_זכות_1,
            '' AS חשבון_חובה_2,
            '' AS סכום_חובה_2,
            '' AS מטח_סכום_חובה_2,
            '' AS חשבון_זכות_2,
            '' AS סכום_זכות_2,
            '' AS מטח_סכום_זכות_2,
            user_description AS פרטים,
            bank_reference AS אסמכתא_1,
            '' AS אסמכתא_2,
            '' AS סוג_תנועה,
           formatted_debit_date AS תאריך_ערך,
           formatted_event_date AS תאריך_3,
           id::text as original_id
    FROM this_month_business
    WHERE
         tax_invoice_amount IS NOT NULL AND
         tax_invoice_amount <> 0 AND
         ABS(tax_invoice_amount) <> event_amount AND
        currency_code != 'ILS'
), withholding_tax as (
    SELECT
            formatted_event_date AS תאריך_חשבונית,
            'ניבמלק' AS חשבון_חובה_1,
            to_char(float8 (ABS(tax_invoice_amount + COALESCE(vat, 0)) - event_amount), 'FM999999999.00') AS סכום_חובה_1,
            null,
            formatted_currency AS מטבע,
            financial_entity AS חשבון_זכות_1,
            to_char(float8 (ABS(tax_invoice_amount + COALESCE(vat, 0)) - event_amount), 'FM999999999.00') AS סכום_זכות_1,
            null AS מטח_סכום_זכות_1,
            '' AS חשבון_חובה_2,
            '' AS סכום_חובה_2,
            '' AS מטח_סכום_חובה_2,
            '' AS חשבון_זכות_2,
            '' AS סכום_זכות_2,
            '' AS מטח_סכום_זכות_2,
            user_description AS פרטים,
            bank_reference AS אסמכתא_1,
            tax_invoice_number AS אסמכתא_2,
            '' AS סוג_תנועה,
           formatted_debit_date AS תאריך_ערך,
           formatted_event_date AS תאריך_3,
           id::text as original_id
    FROM this_month_business
    WHERE
         tax_invoice_amount IS NOT NULL AND
         tax_invoice_amount <> 0 AND
         ABS(tax_invoice_amount) <> event_amount AND
         withholding_tax IS NOT NULL
), all_vat_for_previous_month as (
    SELECT
       SUM(vat) as amount
    FROM
         merged_tables
    WHERE
         event_date::text::date >= (date_trunc('month', month_input::date) - interval '1 month')::date AND
         event_date::text::date <= (date_trunc('month', month_input::date) - interval '1 day')::date
), all_vat_to_recieve_for_previous_month as ( /* מעמ תשומות */
    SELECT
       to_char(
           (date_trunc('month', month_input::date) + interval '1 month' - interval '1 day')::date
       , 'DD/MM/YYYY') AS תאריך_חשבונית,
       'מעמחוז' AS חשבון_חובה_1,
       to_char(float8 (ABS( SUM(vat)))  , 'FM999999999.00') AS סכום_חובה_1,
       NULL AS מטח_סכום_חובה_1,
       NULL AS מטבע,
       'תשו' AS חשבון_זכות_1,
       to_char(float8 (ABS( SUM(vat)))  , 'FM999999999.00') AS סכום_זכות_1,
       NULL AS מטח_סכום_זכות_1,
       NULL AS חשבון_חובה_2,
       NULL AS סכום_חובה_2,
       NULL AS מטח_סכום_חובה_2,
       NULL AS חשבון_זכות_2,
       NULL AS סכום_זכות_2,
       NULL AS מטח_סכום_זכות_2,
       NULL AS פרטים,
       NULL::integer AS אסמכתא_1,
       NULL AS אסמכתא_2,
       NULL AS סוג_תנועה,
       to_char(
           (date_trunc('month', month_input::date) + interval '1 month' - interval '1 day')::date
       , 'DD/MM/YYYY') AS תאריך_ערך,
       NULL AS תאריך_3,
       '' as original_id
    FROM
         merged_tables
    WHERE
         event_date::text::date >= (date_trunc('month', month_input::date))::date AND
         event_date::text::date <= (date_trunc('month', month_input::date) + interval '1 month' - interval '1 day')::date AND
         vat > 0
), all_vat_to_pay_for_previous_month as ( /* מעמ עסקאות */
    SELECT
       to_char(
           (date_trunc('month', month_input::date) + interval '1 month' - interval '1 day')::date
       , 'DD/MM/YYYY') AS תאריך_חשבונית,
       'עסק' AS חשבון_חובה_1,
       to_char(float8 (ABS( SUM(vat)))  , 'FM999999999.00') AS סכום_חובה_1,
       NULL AS מטח_סכום_חובה_1,
       NULL AS מטבע,
       'מעמחוז' AS חשבון_זכות_1,
       to_char(float8 (ABS( SUM(vat)))  , 'FM999999999.00') AS סכום_זכות_1,
       NULL AS מטח_סכום_זכות_1,
       NULL AS חשבון_חובה_2,
       NULL AS סכום_חובה_2,
       NULL AS מטח_סכום_חובה_2,
       NULL AS חשבון_זכות_2,
       NULL AS סכום_זכות_2,
       NULL AS מטח_סכום_זכות_2,
       NULL AS פרטים,
       NULL::integer AS אסמכתא_1,
       NULL AS אסמכתא_2,
       NULL AS סוג_תנועה,
       to_char(
           (date_trunc('month', month_input::date) + interval '1 month' - interval '1 day')::date
       , 'DD/MM/YYYY') AS תאריך_ערך,
       NULL AS תאריך_3,
       '' as original_id
    FROM
         merged_tables
    WHERE
         event_date::text::date >= (date_trunc('month', month_input::date))::date AND
         event_date::text::date <= (date_trunc('month', month_input::date) + interval '1 month' - interval '1 day')::date AND
         vat < 0
), all_reports as (
    SELECT * FROM two_sides
    UNION ALL
    SELECT * FROM one_side
    UNION ALL
    SELECT * FROM invoice_rates_change
    UNION ALL
    SELECT * FROM conversions
    UNION ALL
    SELECT * FROM conversions_fees
    UNION ALL
    SELECT * FROM transfer_fees
    UNION ALL
    SELECT * FROM all_vat_to_recieve_for_previous_month
    UNION ALL
    SELECT * FROM all_vat_to_pay_for_previous_month
    UNION ALL
    SELECT * FROM withholding_tax
), checking_asmachta2 as (
    SELECT
           אסמכתא_2,
           פרטים,
           *
    FROM full_report_selection
    WHERE
        personal_category <> 'conversion' AND
        financial_entity <> 'Isracard' AND
        financial_entity <> 'Uri Goldshtein' AND
        financial_entity <> 'Poalim' AND
        אסמכתא_2 IS NULL
)
SELECT *
FROM all_reports
ORDER BY to_date(תאריך_חשבונית, 'DD/MM/YYYY'), אסמכתא_1 desc, אסמכתא_2 desc, סכום_חובה_1 desc, חשבון_חובה_1 desc;



$$;