*** Settings ***
Library    SeleniumLibrary
Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        chrome
${URL}            http://localhost:3001/login
${USERNAME}       admin123
${PASSWORD}       123456789
${SEARCH_TEXT}    ระบบคำนวณราคาผิด

*** Test Cases ***
Verify Admin Can Search Report Successfully
    Login To System
    Go To Report Management
    Search Report
    Verify Search Result

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

Search Report
    Wait Until Location Contains    reports    10s

    Wait Until Element Is Visible    xpath=//input[contains(@placeholder,"ค้นหา")]    15s
    Capture Page Screenshot    search_box_visible.png

    Clear Element Text    xpath=//input[contains(@placeholder,"ค้นหา")]
    Input Text            xpath=//input[contains(@placeholder,"ค้นหา")]    ${SEARCH_TEXT}
    Capture Page Screenshot    search_text_entered.png

    Sleep    2s
    Capture Page Screenshot    search_result_displayed.png

Verify Search Result
    Wait Until Page Contains    ${SEARCH_TEXT}    10s
    Capture Page Screenshot    search_verify_success.png
