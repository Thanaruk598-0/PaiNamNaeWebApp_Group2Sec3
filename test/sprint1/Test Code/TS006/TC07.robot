*** Settings ***
Library    SeleniumLibrary

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        chrome
${URL}            http://localhost:3001/login
${ADMIN_USER}     admin123
${ADMIN_PASS}     123456789
${REPORT_ID}      cmlro327q0004124t4t68g2cg

*** Test Cases ***
Update Report Status To InProgress
    Login As Admin
    Open Report Management
    Open Report Detail
    Update Status    IN_PROGRESS    ทางเรากำลังดำเนินการตรวจสอบข้อมูล

*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s
    Capture Page Screenshot    update_login_open.png


Login As Admin
    Wait Until Element Is Visible    id=identifier    15s
    Capture Page Screenshot    update_login_page.png

    Input Text    id=identifier    ${ADMIN_USER}
    Input Text    xpath=//input[@type="password"]    ${ADMIN_PASS}
    Capture Page Screenshot    update_login_filled.png

    Click Element    xpath=//button[normalize-space()="เข้าสู่ระบบ"]
    Wait Until Element Is Not Visible    id=identifier    15s
    Capture Page Screenshot    update_login_success.png


Open Report Management
    Go To    http://localhost:3001/admin/reports
    Wait Until Location Contains    admin/reports    15s
    Capture Page Screenshot    update_reports_page.png


Open Report Detail
    Go To    http://localhost:3001/admin/reports/${REPORT_ID}
    Wait Until Location Contains    admin/reports    15s

    Wait Until Keyword Succeeds    15s    1s
    ...    Element Should Be Visible    xpath=//select

    Capture Page Screenshot    update_detail_page_loaded.png


Update Status
    [Arguments]    ${status_value}    ${note}

    # เลือกสถานะ
    Select From List By Value    xpath=//select    ${status_value}
    Capture Page Screenshot    update_status_selected.png

    Wait Until Element Is Visible
    ...    xpath=//textarea[contains(@placeholder,"หมายเหตุ")]
    ...    5s


    Execute JavaScript
    ...    var el = document.querySelector("textarea[placeholder*='หมายเหตุ']");
    ...    el.value = "${note}";
    ...    el.dispatchEvent(new Event('input', { bubbles: true }));
    ...    el.dispatchEvent(new Event('change', { bubbles: true }));

    Capture Page Screenshot    update_note_entered.png


    Execute JavaScript
    ...    document.evaluate("//button[normalize-space()='บันทึก']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();

    Capture Page Screenshot    update_save_clicked.png
    Sleep    2s


    Reload Page
    Wait Until Element Is Visible    xpath=//select    10s
    Capture Page Screenshot    update_page_reloaded.png


    ${selected_label}=    Get Selected List Label    xpath=//select
    Should Contain    ${selected_label}    กำลังดำเนินการ
    Capture Page Screenshot    update_status_verified.png


    ${saved_note}=    Get Value    xpath=//textarea[contains(@placeholder,"หมายเหตุ")]
    Should Be Equal    ${saved_note}    ${note}
    Capture Page Screenshot    update_note_verified.png


