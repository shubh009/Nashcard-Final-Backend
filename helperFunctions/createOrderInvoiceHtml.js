const createOrderInvoiceHtml = (user, invoiceNumber) => {

    // today date format - October 9, 2023
    const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Calculate line total for each item
    const price = (user[0].orders.pricepercard * user[0].orders.cardcount) + user[0].orders.insuranceammount
    const lineTotal1 = user[0].orders.cardsaverqty * user[0].orders.cardsaverprice;
    const lineTotal2 = user[0].orders.NonLoggedCardCount * user[0].orders.Percardpriceofnonloggedcard;
    const lineTotal3 = user[0].orders.NumberofReviewPasses * user[0].orders.PassesPrice;

    // Calculate subtotal
    const subtotal = price+lineTotal1 + lineTotal2 + lineTotal3;

    // Set values for Net, Subtotal, Total, Paid to Date, and Balance Due
    const net = subtotal;
    const total = subtotal;
    const paidToDate = total; // Assuming paid amount is same as total for now
    const balanceDue = total - paidToDate;
    const invoiceTotal = total;


    const htmlContent = `
    <html>
    
    <head>
        <!-- CSS styles -->
        <style>
            /* Styles for body */
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: white; /* Set background color */
            }
            
            /* Styles for table */
            table {
                width: 100%;
                margin-top: 20px;
                height: fit-content;
                border-collapse: collapse;
            }
            
            /* Styles for table header */
            .table_header {
                font-weight: bold;
                font-size: 21px;
                border-bottom: none;
            }
            
            /* Styles for table header background */
            thead {
                background-color: rgba(128, 128, 128, 0.315);
                height: 44px;
            }
            
            /* Styles for table data cells */
            td {
                color: black;
            }
            
            /* Styles for specific table header rows */
            .table_header_row :first-child {
                width: 35%;
                padding-left: 15px;
            }
            
            .table_header_row :nth-child(2) {
                width: 26%;
            }
            
            .table_header_row :last-child {
                text-align: right;
                padding-right: 15px;
            }
            
            /* Styles for table data rows */
            td {
                height: 55px;
                border-bottom: 2px solid rgba(128, 128, 128, 0.315);
                font-size: 21px;
            }
            
            /* Styles for line total column */
            .line_total_column {
                text-align: right;
                padding-right: 15px;
            }
            
            /* Styles for item column */
            .item_column {
                padding-left: 15px;
            }
            
            /* Styles for final output container */
            .final_output_container {
                margin-top: 100px; /* Adjust margin top */
                float: right;
                margin-top: 60px; /* Adjust margin top */
                height: fit-content;
                margin-bottom: 200px; /* Adjust margin bottom */
            }
            
            /* Styles for final output */
            .final_output {
                display: flex;
                height: 30px;
                width: 350px;
                font-size: 20px;
                align-items: center;
                justify-content: space-between;
            }
            
            /* Styles for text below logo */
            .below_logo_text {
                display: flex;
                height: 32px;
                width: 350px;
                font-size: 20px;
                align-items: center;
                justify-content: space-between;
            }
            
            /* Additional style for below logo text */
            .below_logo_text {
                text-align: left;
            }
            
            /* Styles for balance due */
            #balance_due {
                height: 37px;
                padding: 0px 5px 0px 5px;
                background-color: rgba(128, 128, 128, 0.315);
            }
            
            /* Styles for containers */
            .basic_details_container,
            .below_logo_text {
                display: flex;
                justify-content: space-between;
            }
            
            /* Styles for logo container */
            .logo_container {
                width: 35%;
            }
            
            /* General container padding */
            .container {
                padding: 20px;
            }
            
            /* Styles for images */
            img {
                height: 150px;
                width: 200px;
            }
            
            /* Adjust width for specific text */
            .below_logo_text>p:last-child {
                width: 45%;
            }
            
            /* Styles for paragraphs */
            p {
                font-size: 20px;
                margin: 10px 2px;
            }
            
            /* Styles for name and email container */
            .name_email_container {
                height: 200px;
            }
        </style>
    </head>
    
    <body>
    
        <div class="container">
    
            <!-- Basic details container -->
            <div class="basic_details_container">
    
                <div class=" ">
                    <!-- Name and email container -->
                    <div class="name_email_container">
                        <p> Nashcards </p>
                        <p> nashcards.com </p>
                        <p> support@nashcards.com </p>
                    </div>
    
                    <!-- Additional details container -->
                    <div>
                    <p> ${user[0].name + " " + user[0].lastname} </p>
                    <p> ${user[0].userid} </p>
                        <p> ${user[0].address} </p>
                        <p> ${user[0].city + ", " + user[0].pincode}, Tennessee 37203</p>
                        <p> ${user[0].state} </p>
                        <p> ${user[0].contact} </p>
                        <p> ${user[0].email} </p>
                    </div>
    
                </div>
    
                <!-- Middle address container -->
                <div class="container_middle_address">
                    <p>300 Pleasant Grove Rd.</p>
                    <p> #340</p>
                    <p>Mt Juliet, TN 37122 </p>
                    <p> United States</p>
    
                </div>
    
                <!-- Logo container -->
                <div class="logo_container">
    
                    <img class=""
                        src="https://nashcards.com/wp-content/uploads/2022/05/mailLogo1@0.5x-2.png" />
                    <div>
                        <!-- Text below logo -->
                        <div class="below_logo_text">
                            <p> Invoice Number</p>
                            <p>${invoiceNumber}</p>
                        </div>
                        <div class="below_logo_text">
                            <p> Invoice Date</p>
                            <p>${todayDate}</p>
                        </div>
                        <div class="below_logo_text">
                            <p>Invoice Total</p>
                            <p>$${paidToDate.toFixed(2)}</p>
                        </div>
                        <div class="below_logo_text">
                            <p>Balance Due</p>
                            <p>$${balanceDue.toFixed(2)}</p>
                        </div>
    
                    </div>
    
                </div>
    
            </div>
    
            <!-- Table -->
            <table>
                <thead>
                    <!-- Table header row -->
                    <tr class="table_header_row">
                        <td class="table_header">Item</td>
                        <td class="table_header">Description</td>
                        <td class="table_header">Unit Cost </td>
                        <td class="table_header">Quantity</td>
                        <td class="table_header">Line Total</td>
                    </tr>
                </thead>
                <tbody class="table_body">
                    <!-- Table body rows -->
                    <tr id="body_first_row" class="table_body_row">
                        <td class="item_column">PSA - Value Bulk (1980-Present) </td>
                        <td>Grading Services </td>
                        <td>$${user[0].orders.pricepercard}</td>
                        <td>${user[0].orders.cardcount}</td>
                        <td class="line_total_column">${((user[0].orders.pricepercard * user[0].orders.cardcount) + user[0].orders.caculatedinsurancecost).toFixed(2)}</td>
                    </tr>
                    <tr class="table_body_row">
                        <td class="item_column">Shipping</td>
                        <td>In Store Pickup</td>
                        <td>$0</td>
                        <td>1</td>
                        <td class="line_total_column">$0.00</td>
                    </tr>
                    <tr class="table_body_row">
                        <td class="item_column">Upcharges/Deductions </td>
                        <td> </td>
                        <td>$${user[0].orders.PSAUpcharge}</td>
                        <td>${user[0].orders.PSASub}</td>
                        <td class="line_total_column">$${user[0].orders.PSAUpcharge * user[0].orders.PSASub}</td>
                    </tr>
                    <tr class="table_body_row">
                        <td class="item_column">Card Savers </td>
                        <td> </td>
                        <td> ${"$ " + user[0].orders.cardsaverprice}</td>
                        <td> ${user[0].orders.cardsaverqty} </td>
                        <td class="line_total_column">${"$ " + Number(user[0].orders.cardsaverqty) * (user[0].orders.cardsaverprice)}  </td>
                    </tr>
                    <tr class="table_body_row">
                        <td class="item_column">Non-Logged Cards
                        </td>
                        <td> </td>
                        <td> ${"$ " + user[0].orders.Percardpriceofnonloggedcard}</td>
                        <td> ${user[0].orders.NonLoggedCardCount} </td>
                        <td class="line_total_column">${"$ " + Number(user[0].orders.NonLoggedCardCount) * (user[0].orders.Percardpriceofnonloggedcard)}  </td>
                    </tr>
                    <tr class="table_body_row">
                        <td class="item_column">Kicks from Review</td>
                        <td> </td>
                        <td>$${user[0].orders.Kicksfromreview}</td>
                        <td>${user[0].orders.NumberOfKicksfromservicelevel}</td>
                        <td class="line_total_column">$${user[0].orders.Kicksfromreview * user[0].orders.NumberOfKicksfromservicelevel}</td>
                    </tr>
                    <tr class="table_body_row">
                        <td class="item_column">Passes from Review </td>
                        <td>Total Number of Passes</td>
                        <td> ${"$ " + user[0].orders.PassesPrice}</td>
                        <td>${user[0].orders.NumberofReviewPasses}</td>
                        <td class="line_total_column">${"$ " + Number(user[0].orders.PassesPrice) * (user[0].orders.NumberofReviewPasses)}</td>
                    </tr>
                </tbody>
            </table>
    
            <!-- Final output container -->
            <div class="final_output_container">
                <div class="final_output">
                    <p>Net </p>
                    <p>$${net.toFixed(2)}</p>
                </div>
                <div class="final_output">
                    <p>Subtotal </p>
                    <p>$${subtotal.toFixed(2)}</p>
                </div>
                <div class="final_output">
                    <p>Total </p>
                    <p>$${invoiceTotal.toFixed(2)}</p>
                </div>
                <div class="final_output">
                    <p>Paid to Date </p>
                    <p>$${paidToDate.toFixed(2)}</p>
                </div>
                <div id="balance_due" class="final_output">
                    <p>Balance Due </p>
                    <p>$${balanceDue.toFixed(2)}</p>
                </div>
                <div class="final_output">
                    <p>Invoice Total </p>
                    <p>$${invoiceTotal.toFixed(2)}</p>
                </div>
            </div>

        </div>
    
    
    </body>
    
    </html>
    `

    return htmlContent
}


module.exports = { createOrderInvoiceHtml }