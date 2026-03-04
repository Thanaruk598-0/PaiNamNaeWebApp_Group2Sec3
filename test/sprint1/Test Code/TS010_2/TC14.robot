*** Settings ***
Library    SeleniumLibrary
Suite Setup       Open Browser To Login
Suite Teardown    Close Browser

*** Variables ***
${URL}              http://localhost:3001/login
${REPORT_URL}       http://localhost:3001/admin/reports
${BROWSER}          chrome
${USERNAME_ADMIN}   admin123
${PASSWORD_ADMIN}   123456789
${ADMIN_MESSAGE}    กำลังตรวจสอบหลักฐานกรุณารอสักครู่ครับ

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
    Capture Page Screenshot    step1_open_login.png

Login As Admin
    Wait Until Element Is Visible    id=identifier    15s
    Capture Page Screenshot    step2_login_page.png

    Input Text    id=identifier    ${USERNAME_ADMIN}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD_ADMIN}
    Capture Page Screenshot    step3_fill_login.png

    Click Element    xpath=//button[@type="submit"]
    Wait Until Page Does Not Contain Element    id=identifier    15s
    Capture Page Screenshot    step4_login_success.png

Open Report Management
    Go To    ${REPORT_URL}
    Wait Until Location Contains    reports    10s
    Capture Page Screenshot    step5_report_management.png

Open Report Detail
    Wait Until Element Is Visible    xpath=(//button[@title="ดู/แก้ไข"])[1]    15s
    Scroll Element Into View         xpath=(//button[@title="ดู/แก้ไข"])[1]
    Capture Page Screenshot    step6_before_open_detail.png

    Execute JavaScript
    ...    document.querySelectorAll("button[title='ดู/แก้ไข']")[0].click();

    Wait Until Location Contains    /admin/reports/    15s
    Capture Page Screenshot    step7_report_detail.png

Send Chat Message As Admin
    Wait Until Location Contains    /admin/reports/    15s

    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight);
    Sleep    1s

    Wait Until Element Is Visible    xpath=//input[contains(@placeholder,"พิมพ์ข้อความ")]    20s
    Capture Page Screenshot    step8_chat_box_visible.png

    Execute JavaScript
    ...    var input = document.querySelector("input[placeholder*='พิมพ์ข้อความ']");
    ...    input.focus();
    ...    input.value = "${ADMIN_MESSAGE}";
    ...    input.dispatchEvent(new Event('input', { bubbles: true }));

    Capture Page Screenshot    step9_message_typed.png
    Sleep    1s

    Execute JavaScript
    ...    document.querySelector("button[type='submit']").click();

    Capture Page Screenshot    step10_message_sent.png

Verify Admin Message Sent
    Wait Until Page Contains Element    xpath=//*[contains(text(),"${ADMIN_MESSAGE}")]    20s
    Capture Page Screenshot    step11_verify_success.png
