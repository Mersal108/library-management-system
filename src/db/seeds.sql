-- Sample data for Library Management System

-- Insert sample users (password: "password123" for all users)
-- Password hash generated with bcrypt, salt rounds: 10
INSERT INTO users (email, password_hash, name) VALUES
('admin@library.com', '$2b$10$fhdZ/4M8/Y/PV1I/THaXlubd7XebOCiDbpQwB./6TvCWQZDdZ/4uq', 'Admin User'),
('user@library.com', '$2b$10$fhdZ/4M8/Y/PV1I/THaXlubd7XebOCiDbpQwB./6TvCWQZDdZ/4uq', 'Regular User');

-- Insert sample books
INSERT INTO books (title, author, isbn, total_quantity, available_quantity, shelf_location) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 5, 5, 'A1'),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 3, 3, 'A2'),
('1984', 'George Orwell', '9780451524935', 4, 4, 'B1'),
('Pride and Prejudice', 'Jane Austen', '9780141439518', 2, 2, 'B2'),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769488', 3, 3, 'C1'),
('Animal Farm', 'George Orwell', '9780451526342', 4, 4, 'C2'),
('Lord of the Flies', 'William Golding', '9780399501487', 3, 3, 'D1'),
('Brave New World', 'Aldous Huxley', '9780060850524', 2, 2, 'D2'),
('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 5, 5, 'E1'),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '9780590353427', 6, 6, 'E2');

-- Insert sample borrowers
INSERT INTO borrowers (name, email) VALUES
('John Doe', 'john.doe@example.com'),
('Jane Smith', 'jane.smith@example.com'),
('Bob Johnson', 'bob.johnson@example.com'),
('Alice Williams', 'alice.williams@example.com'),
('Charlie Brown', 'charlie.brown@example.com');

-- Note: Borrowings will be created through the API checkout endpoint
