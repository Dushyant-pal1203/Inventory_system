# Medical Invoice System - Design Guidelines

## Design Approach
**System-Based with Custom Medical Aesthetic**
Using Material Design principles for form inputs and data tables, customized with professional medical styling inspired by the provided Malkani Health Centre invoice reference.

## Core Design Principles

### 1. Typography
- **Primary Font**: Inter or Roboto (professional, clean)
- **Headings**: font-semibold to font-bold, sizes from text-2xl (page titles) to text-lg (section headers)
- **Body Text**: text-base for forms, text-sm for table data and labels
- **Invoice Headers**: text-3xl font-bold for clinic name, text-lg for section titles

### 2. Layout System
**Spacing Units**: Consistently use Tailwind units of 3, 4, 6, 8, and 12
- Component padding: p-6 or p-8
- Section margins: my-8 or my-12
- Form field spacing: space-y-4
- Table cell padding: px-4 py-3

**Container Strategy**:
- Max width: max-w-4xl for forms, max-w-5xl for invoice
- Centered layouts: mx-auto
- Card-based components with rounded-lg and subtle shadows

### 3. Component Library

#### Home Page - Medicine Selection
**Medicine Entry Card**:
- White background (bg-white), rounded-lg border
- Dropdown select for medicine name (full width)
- Number input for quantity (smaller width, right-aligned)
- "Add More" button: outlined style, positioned below entries
- "Next" button: solid primary (green) style, prominent, right-aligned
- Display running cart summary as items are added (medicine name, quantity, subtotal)

**Form Controls**:
- Select dropdowns: border, rounded, px-4 py-2.5, focus ring
- Number inputs: border, rounded, text-center, w-24
- Clear labels above each field (text-sm font-medium)

#### Invoice Page
**Header Section**:
- Professional green header bar (matching reference green tone)
- Clinic name in large bold white text
- Subtitle/tagline in smaller white text
- Clean separation from body content

**Client Details Form**:
- Two-column grid (md:grid-cols-2)
- Input fields for: Patient Name, Date, Contact, Address
- Minimal labels, clean borders
- Spacing: gap-4 between fields

**Invoice Table**:
- Full-width responsive table with bordered cells
- Columns: Description (medicine name) | Quantity | Rate | Amount
- Header row: medium font weight, subtle background
- Data rows: alternating subtle background (zebra striping)
- Right-aligned numbers in Quantity/Rate/Amount columns
- Bottom summary section: Subtotal, Tax (%), Total Due - right-aligned, bold total

**Action Buttons**:
- "Download PDF" button: solid green, prominent size (px-6 py-3)
- Icon integration: download icon from Heroicons
- Positioned prominently below invoice table

### 4. Visual Hierarchy
- **Primary Green**: Medical/health theme green (matching reference invoice)
- **Backgrounds**: White cards on light gray page background
- **Borders**: Subtle gray borders (border-gray-200)
- **Shadows**: Soft shadows on cards (shadow-md)
- **Focus States**: Green ring on form inputs

### 5. Responsive Behavior
- Mobile: Single column forms, stacked medicine entries
- Tablet/Desktop: Two-column client details, full-width tables
- Invoice table: Horizontal scroll on mobile if needed
- Breakpoints: Use md: and lg: prefixes

### 6. Professional Details
- Invoice number generation (auto-increment or date-based)
- Date display in consistent format (MM/DD/YYYY)
- Currency formatting with 2 decimal places
- Tax percentage display with % symbol
- Clean separation lines between invoice sections

### 7. Navigation Flow
- Clear progression: Home (Selection) → Invoice (Review & Download)
- Back button on invoice page to return and edit
- Success feedback after adding medicines
- Clear visual indication of cart items before proceeding

## Icons
Use **Heroicons** (outline style) via CDN:
- Plus icon for "Add More" button
- Download icon for PDF button
- Shopping cart icon for cart summary
- Trash icon for removing cart items

## Accessibility
- Proper label-input associations
- Focus visible indicators on all interactive elements
- Semantic HTML table structure
- ARIA labels for icon buttons
- Keyboard navigation support for forms

## Images
**No hero images required** - This is a utility application focused on functionality. Professional typography and clean layout convey credibility without imagery.