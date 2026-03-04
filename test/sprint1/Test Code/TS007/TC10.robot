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
Verify Admin Can Delete Report Successfully
    Login To System
    Go To Report Management
    Delete First Report
    Verify Delete Success Message

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s
    Capture Page Screenshot    delete_login_open.png

Login To System
    Wait Until Element Is Visible    id=identifier    15s
    Capture Page Screenshot    delete_login_page.png

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Capture Page Screenshot    delete_login_filled.png

    Click Element    xpath=//button[normalize-space()="เข้าสู่ระบบ"]
    Wait Until Element Is Not Visible    id=identifier    15s
    Capture Page Screenshot    delete_login_success.png

Go To Report Management
    Go To    http://localhost:3001/admin/reports
    Wait Until Location Contains    reports    10s
    Capture Page Screenshot    delete_report_page.png

Delete First Report
    Wait Until Element Is Visible    xpath=(//button[@title="ลบ"])[1]    15s
    Scroll Element Into View         xpath=(//button[@title="ลบ"])[1]
    Capture Page Screenshot    delete_before_click_trash.png

    Execute JavaScript
    ...    document.evaluate("(//button[@title='ลบ'])[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();

    Wait Until Element Is Visible
    ...    xpath=//button[contains(@class,"bg-red-600") and normalize-space()="ลบถาวร"]
    ...    10s

    Capture Page Screenshot    delete_modal_visible.png
    Scroll Element Into View
    ...    xpath=//button[contains(@class,"bg-red-600") and normalize-space()="ลบถาวร"]

    Sleep    1s

    Execute JavaScript
    ...    document.evaluate("//button[contains(@class,'bg-red-600') and normalize-space()='ลบถาวร']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();

    Capture Page Screenshot    delete_confirm_clicked.png
    Sleep    2s

Verify Delete Success Message
    Wait Until Page Contains    ลบรายงานเรียบร้อย    10s
    Capture Page Screenshot    delete_success.png
