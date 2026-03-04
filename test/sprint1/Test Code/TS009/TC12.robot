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
Verify Admin Can Filter Reports Successfully
    Login To System
    Go To Report Management
    Apply Filters
    Verify Filter Result

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s
    Capture Page Screenshot    login_open.png

Login To System
    Wait Until Element Is Visible    id=identifier    15s
    Capture Page Screenshot    login_page.png

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Capture Page Screenshot    login_filled.png

    Click Element    xpath=//button[normalize-space()="เข้าสู่ระบบ"]
    Wait Until Element Is Not Visible    id=identifier    15s
    Capture Page Screenshot    login_success.png

Go To Report Management
    Go To    http://localhost:3001/admin/reports
    Wait Until Location Contains    reports    10s
    Capture Page Screenshot    report_management_page.png

Apply Filters
    Wait Until Element Is Visible    xpath=(//select)[1]    10s
    Capture Page Screenshot    before_filter.png

    Select From List By Value    xpath=(//select)[1]    RESOLVED
    Capture Page Screenshot    status_resolved.png

    Select From List By Value    xpath=(//select)[2]    DRIVER
    Capture Page Screenshot    category_driver.png

    Select From List By Value    xpath=(//select)[3]    HIGH
    Capture Page Screenshot    priority_high.png

    Select From List By Value    xpath=(//select)[4]    createdAt:desc
    Sleep    2s
    Capture Page Screenshot    filter_applied.png

Verify Filter Result
    Page Should Contain Element    xpath=//span[contains(text(),"RESOLVED")]
    Page Should Contain Element    xpath=//span[contains(text(),"คนขับ")]
    Page Should Contain Element    xpath=//span[contains(text(),"HIGH")]

    Capture Page Screenshot    filter_verify_success.png
