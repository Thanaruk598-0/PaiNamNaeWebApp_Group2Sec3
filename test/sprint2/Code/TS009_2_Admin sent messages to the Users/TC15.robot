*** Settings ***
Library    SeleniumLibrary
Suite Setup       Open Browser To Login
Suite Teardown    Close Browser

*** Variables ***
${URL}              http://localhost:3001/login
${REPORT_URL}       http://localhost:3001/admin/reports
${BROWSER}          chrome
${USERNAME}   admin123
${PASSWORD}   123456789
${ADMIN_MESSAGE}    รบกวนขอภาพหลักฐานเพิ่มเติมด้วยครับ

*** Test Cases ***
Admin Send Chat Message To User Successfully
    Login As Admin
    Open Report Management
    Open Report Detail
    Send Chat Message As Admin
    Verify Admin Message Sent

*** Keywords ***
Open Browser To Login
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s


Login As Admin
    Wait Until Element Is Visible    id=identifier    15s


    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}


    Click Element    xpath=//button[@type="submit"]
    Wait Until Page Does Not Contain Element    id=identifier    15s


Open Report Management
    Go To    ${REPORT_URL}
    Wait Until Location Contains    reports    10s


Open Report Detail
    Wait Until Element Is Visible    xpath=(//button[@title="ดู/แก้ไข"])[1]    15s
    Scroll Element Into View         xpath=(//button[@title="ดู/แก้ไข"])[1]
    Capture Page Screenshot   before_open_detail.png

    Execute JavaScript
    ...    document.querySelectorAll("button[title='ดู/แก้ไข']")[0].click();

    Wait Until Location Contains    /admin/reports/    15s
    Capture Page Screenshot    report_detail.png

Send Chat Message As Admin
    Wait Until Location Contains    /admin/reports/    15s

    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight);
    Sleep    1s

    Wait Until Element Is Visible    xpath=//input[contains(@placeholder,"พิมพ์ข้อความ")]    20s
    Capture Page Screenshot    chat_box_visible.png

    Execute JavaScript
    ...    var input = document.querySelector("input[placeholder*='พิมพ์ข้อความ']");
    ...    input.focus();
    ...    input.value = "${ADMIN_MESSAGE}";
    ...    input.dispatchEvent(new Event('input', { bubbles: true }));

    Capture Page Screenshot    message_typed.png
    Sleep    1s

    Execute JavaScript
    ...    document.querySelector("button[type='submit']").click();

    Capture Page Screenshot    message_sent.png

Verify Admin Message Sent
    Wait Until Page Contains Element    xpath=//*[contains(text(),"${ADMIN_MESSAGE}")]    20s
    Capture Page Screenshot    verify_success.png
