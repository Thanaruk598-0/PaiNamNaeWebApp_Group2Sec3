*** Settings ***
Library    SeleniumLibrary

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        chrome
${URL}            http://localhost:3001/login
${USERNAME}       admin123
${PASSWORD}       123456789

*** Test Cases ***
Verify Admin Can View Submitted Reports
    Login To System
    Go To Report Management
    Verify Reports Displayed Correctly

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s
    Capture Page Screenshot    admin_view_login_open.png

Login To System
    Wait Until Element Is Visible    id=identifier    15s
    Capture Page Screenshot    admin_view_login_page.png

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Capture Page Screenshot    admin_view_login_filled.png

    Click Element    xpath=//button[normalize-space()="เข้าสู่ระบบ"]
    Wait Until Element Is Not Visible    id=identifier    15s
    Capture Page Screenshot    admin_view_login_success.png

Go To Report Management
    Go To    http://localhost:3001/admin/reports
    Wait Until Location Contains    reports    10s
    Capture Page Screenshot    admin_view_reports_page.png

Verify Reports Displayed Correctly
    Location Should Contain    reports
    Capture Page Screenshot    admin_view_table_loaded.png

    Wait Until Page Contains    ผู้แจ้ง    15s
    Page Should Contain    ประเภท
    Page Should Contain    ความสำคัญ
    Page Should Contain    หัวข้อ
    Page Should Contain    สถานะ
    Page Should Contain    วันที่แจ้ง
    Page Should Contain    การกระทำ
    Capture Page Screenshot    admin_view_column_verified.png

    Page Should Contain    User1nakub nakub
    Page Should Contain    User1@gmail.com
    Capture Page Screenshot    admin_view_user_verified.png

    Page Should Contain Element    xpath=//span[contains(text(),"คนขับ")]
    Capture Page Screenshot    admin_view_category_verified.png

    Page Should Contain Element    xpath=//span[contains(text(),"HIGH")]
    Capture Page Screenshot    admin_view_priority_verified.png

    Page Should Contain Element    xpath=//span[contains(text(),"IN_PROGRESS")]
    Capture Page Screenshot    admin_view_status_verified.png

    Page Should Contain Element    xpath=//*[contains(text(),"คนขับ ขับรถหวาดเสียว")]
    Capture Page Screenshot    admin_view_description_verified.png

    Page Should Contain Element    xpath=//*[contains(text(),"256")]
    Capture Page Screenshot    admin_view_date_verified.png

    Page Should Contain Element
    ...    xpath=//*[contains(@class,"fa-eye") or contains(@class,"view") or name()="svg"]
    Page Should Contain Element
    ...    xpath=//*[contains(@class,"fa-trash") or contains(@class,"delete") or name()="svg"]

    Capture Page Screenshot    admin_view_action_icons_verified.png
