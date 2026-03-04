*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        Chrome
${URL}            http://localhost:3001/login
${REPORT_URL}     http://localhost:3001/admin/reports
${ADMIN_USER}     admin123
${ADMIN_PASS}     123456789

*** Test Cases ***
Verify Admin Can View Submitted Reports
    Login As Admin
    Open Report Management
    Verify Report Table Displayed

*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.7s


Login As Admin
    Wait Until Element Is Visible    id=identifier    15s

    Input Text    id=identifier    ${ADMIN_USER}
    Input Text    xpath=//input[@type="password"]    ${ADMIN_PASS}

    Click Element    xpath=//button[@type="submit"]

    Wait Until Location Contains    3001    15s


Open Report Management
    Go To    ${REPORT_URL}
    Wait Until Location Contains    admin/reports    15s
    Wait Until Page Contains    ผู้แจ้ง    15s
    Capture Page Screenshot    tc05_report_management_page.png


Verify Report Table Displayed

    Page Should Contain    ผู้แจ้ง
    Page Should Contain    ประเภท
    Page Should Contain    ความสำคัญ
    Page Should Contain    สถานะ
    Page Should Contain    วันที่แจ้ง
    Page Should Contain    การกระทำ

    # ตรวจ action icon
    Page Should Contain Element    xpath=//*[contains(@class,'fa-eye') or contains(@title,'ดู')]
    Page Should Contain Element    xpath=//*[contains(@class,'fa-trash') or contains(@title,'ลบ')]

    Capture Page Screenshot    tc05_report_verified.png