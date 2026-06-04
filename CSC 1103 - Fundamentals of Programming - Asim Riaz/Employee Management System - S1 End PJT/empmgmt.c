#include <stdio.h>
#include <string.h>

// 1. STRUCTURE DEFINITION

struct Employee {
    int id;
    char name[50];
    char designation[50];
    char department[50];
    float salary;
};

// 2. FILE HANDLING FUNCTIONS (Text Mode)

// Function to SAVE data to a text file
void saveToFile(struct Employee employees[], int count) {
    FILE *file = fopen("employees.txt", "w"); // "w" for Write Text

    if (file == NULL) {
        printf("Error: Could not create file.\n");
        return;
    }

    // Loop through the array and write each employee to the file
    for (int i = 0; i < count; i++) {
        fprintf(file, "%d\n", employees[i].id);
        fprintf(file, "%s\n", employees[i].name);
        fprintf(file, "%s\n", employees[i].designation);
        fprintf(file, "%s\n", employees[i].department);
        fprintf(file, "%.2f\n", employees[i].salary);
    }

    fclose(file);
    printf(">> Data saved successfully to employees.txt (%d records).\n", count);
}


// Function to LOAD data from a text file
void loadFromFile(struct Employee employees[], int *count) {
    FILE *file = fopen("employees.txt", "r"); // "r" for Read Text
    *count = 0;

    if (file == NULL) {
        printf(">> No existing data found. Starting fresh.\n");
        return;
    }

    // We loop until we reach the End Of File (EOF)
    while (fscanf(file, "%d", &employees[*count].id) != EOF) {
        
        // CRITICAL: Consume the leftover newline character after reading ID
        fgetc(file); 

        // Read Name
        fgets(employees[*count].name, 50, file);
        employees[*count].name[strcspn(employees[*count].name, "\n")] = 0; // Remove the 'enter' key that fgets captures at the end of the string

        // Read Designation
        fgets(employees[*count].designation, 50, file);
        employees[*count].designation[strcspn(employees[*count].designation, "\n")] = 0;

        // Read Department
        fgets(employees[*count].department, 50, file);
        employees[*count].department[strcspn(employees[*count].department, "\n")] = 0;

        // Read Salary
        fscanf(file, "%f", &employees[*count].salary);
        
        // Consume the newline after reading Salary so the next loop starts clean
        fgetc(file); 

        (*count)++; // Increment the counter for the next employee
    }

    fclose(file);
    printf(">> Data loaded successfully (%d records).\n", *count);
}





// MEMBER 2 CODE: DATA ENTRY (Add & Display)

// writing to the arrays.
void addEmployee(struct Employee employees[], int *count) {

    // if there are 100 employees already, print 'error'
    if (*count >= 100) {
        printf("Error: Database is full (Max 100 employees).\n");
        return;
    }

    printf("\n--- Add New Employee ---\n");

    printf("Enter ID: ");
    scanf("%d", &employees[*count].id);
    while ((getchar()) != '\n'); // Clear buffer caused by scanf

    printf("Enter Name: ");  // Input Name to the array 'employees'
    fgets(employees[*count].name, 50, stdin);
    employees[*count].name[strcspn(employees[*count].name, "\n")] = 0;  // consuming leftover newline.

    printf("Enter Designation: ");  // Input Designation to the array 'employees'
    fgets(employees[*count].designation, 50, stdin);
    employees[*count].designation[strcspn(employees[*count].designation, "\n")] = 0;

    printf("Enter Department: ");  // Input Dept to the array 'employees'
    fgets(employees[*count].department, 50, stdin);
    employees[*count].department[strcspn(employees[*count].department, "\n")] = 0;

    printf("Enter Salary: ");  // Input Salary to the array 'employees'
    scanf("%f", &employees[*count].salary);

    (*count)++; // Increment count
    printf(">> Success: Employee added!\n");  // print a static statement when all of this is added inside an array
}


// displaying from arrays
void displayAllEmployees(struct Employee employees[], int count) {

    // if there are no employees whatsoever
    if (count == 0) {
        printf("\n>> No records found to display.\n");
        return;
    }

    // Header (formatted)
    printf("\n%-10s | %-20s | %-20s | %-15s | %-10s\n", "ID", "Name", "Designation", "Department", "Salary");
    printf("---------------------------------------------------------------------------------\n");

    // actual display statement (space-formatted)
    for (int i = 0; i < count; i++) {
        printf("%-10d | %-20s | %-20s | %-15s | %-10.2f\n", 
               employees[i].id, employees[i].name, employees[i].designation, 
               employees[i].department, employees[i].salary);
    }
    printf("---------------------------------------------------------------------------------\n");
}





// MEMBER 3 CODE: THE ANALYST (Search & Update)

// Function to search an employee by ID
void searchEmployee(struct Employee employees[], int count) {
    int searchID;          // ID entered by user to search
    int found = 0;         // Flag to check if record is found or not

    printf("\n--- Search Employee ---\n");
    printf("Enter ID to search: ");
    scanf("%d", &searchID);   // Take employee ID from user

    // Loop through all employees
    for (int i = 0; i < count; i++) {

        // Check if current employee ID matches searched ID
        if (employees[i].id == searchID) {
            printf("\n>> Record Found!\n");

            // Display employee details
            printf("ID: %d | Name: %s | Role: %s | Dept: %s | Salary: %.2f\n",
                   employees[i].id,
                   employees[i].name,
                   employees[i].designation,
                   employees[i].department,
                   employees[i].salary);

            found = 1;     // Set flag to true
            break;         // Exit loop once record is found
        }
    }

    // If no record found after loop
    if (!found)
        printf("\n>> Error: Employee with ID %d not found.\n", searchID);
}


// Function to update employee details (designation or salary)
void updateEmployee(struct Employee employees[], int count) {
    int updateID;          // ID of employee to update
    int foundIndex = -1;   // Stores index if employee is found
    int choice;            // User choice for what to update

    printf("\n--- Update Employee Details ---\n");
    printf("Enter ID of employee to update: ");
    scanf("%d", &updateID);   // Take ID from user

    // Search for employee with given ID
    for (int i = 0; i < count; i++) {
        if (employees[i].id == updateID) {
            foundIndex = i;   // Store index of found employee
            break;
        }
    }

    // If employee is found (index position NOT equals to '-1')
    if (foundIndex != -1) {
        printf("Updating User: %s\n", employees[foundIndex].name);  // non-static print statement just to showcase which employee is being updated currently.

        // Show update options
        printf("1. Update Designation\n2. Update Salary\nChoose: ");
        scanf("%d", &choice);

        // Clear input buffer (important before fgets)
        while ((getchar()) != '\n');

        // Update designation
        if (choice == 1) {
            printf("Enter New Designation: ");
            fgets(employees[foundIndex].designation, 50, stdin);  // input the designation into that 'specific index'

            // Remove newline character added by fgets
            employees[foundIndex].designation[
                strcspn(employees[foundIndex].designation, "\n")
            ] = 0;

            printf(">> Designation Updated!\n");
        }

        // Update salary
        else if (choice == 2) {
            printf("Enter New Salary: ");
            scanf("%f", &employees[foundIndex].salary);  // input the salary into that 'specific index'
            printf(">> Salary Updated!\n");
        }
    }
    // If employee ID not found
    else {
        printf("\n>> Error: ID %d not found.\n", updateID);
    }
}





// MEMBER 4 CODE: THE CONTROLLER (Delete & Main Menu)

// This function removes an employee from the list using their ID
void deleteEmployee(struct Employee employees[], int *count) {
    int deleteID, foundIndex = -1;

    printf("\n--- Delete Employee ---\n");
    printf("Enter ID to delete: ");
    scanf("%d", &deleteID);

    //Look for the employee in the list
    for (int i = 0; i < *count; i++) {
        if (employees[i].id == deleteID) {
            foundIndex = i; // Remember where we found them
            break;
        }
    }

    // If found, remove them
    if (foundIndex != -1) {
        // Move all employees after this one one spot to the left
        // This fills the empty gap
        for (int i = foundIndex; i < *count - 1; i++) {
            employees[i] = employees[i + 1];
        }

        // Reduce the total number of employees by 1
        (*count)--;
        printf(">> Success: Employee ID %d deleted.\n", deleteID);
    } else {
        // If the ID does not exist
        printf(">> Error: ID %d not found.\n", deleteID);
    }
}





// MAIN FUNCTION: This is where the program starts
int main() {
    struct Employee employees[100]; // Array to hold up to 100 people
    int count = 0;                  // Keeps track of how many employees we have
    int choice;                     // Stores the user's menu choice

    // Load data from the file when the program starts
    loadFromFile(employees, &count);

    // Keep showing the menu until the user chooses to exit
    do {
        printf("\n=== EMPLOYEE MANAGEMENT SYSTEM ===\n");
        printf("1. Add Employee\n");
        printf("2. Display All Employees\n");
        printf("3. Search Employee\n");
        printf("4. Update Employee\n");
        printf("5. Delete Employee\n");
        printf("6. Save & Exit\n");
        printf("----------------------------------\n");
        printf("Enter Choice: ");
        scanf("%d", &choice);

        // Run the correct function based on the user's choice
        switch(choice) {
            case 1: addEmployee(employees, &count); break;
            case 2: displayAllEmployees(employees, count); break;
            case 3: searchEmployee(employees, count); break;
            case 4: updateEmployee(employees, count); break;
            case 5: deleteEmployee(employees, &count); break;
            case 6: 
                // Save the data to the file before quitting
                saveToFile(employees, count); 
                printf(">> Exiting System. Goodbye!\n");
                break;
            default: 
                printf("Invalid choice! Try again.\n");
        }
    } while (choice != 6); // If choice is 6, the loop stops

    return 0; // Program finished successfully
}