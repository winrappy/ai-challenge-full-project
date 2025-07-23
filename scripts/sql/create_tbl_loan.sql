CREATE TABLE loan_applications (
    application_id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    monthly_income INT NOT NULL,
    loan_amount INT NOT NULL,
    loan_purpose VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL
);