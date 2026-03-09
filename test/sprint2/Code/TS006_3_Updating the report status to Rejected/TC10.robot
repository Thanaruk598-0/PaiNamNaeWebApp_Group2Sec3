*** Settings ***
Library    SeleniumLibrary

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        chrome
${URL}            http://localhost:3001/login
${ADMIN_USER}     admin123
${ADMIN_PASS}     123456789
${REPORT_ID}      cmmateekw0007uh12bpe2tjnm

*** Test Cases ***
Update Report Status To REJECTED
    Login As Admin
    Open Report Management
    Open Report Detail
    Update Status    REJECTED    ข้อมูลไม่เพียงพอ

*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s


Login As Admin
    Wait Until Element Is Visible    id=identifier    15s
    Input Text    id=identifier    ${ADMIN_USER}
    Input Text    xpath=//input[@type="password"]    ${ADMIN_PASS}
    Click Element    xpath=//button[normalize-space()="เข้าสู่ระบบ"]
    Wait Until Element Is Not Visible    id=identifier    15s


Open Report Management
    Go To    http://localhost:3001/admin/reports
    Wait Until Location Contains    admin/reports    15s


Open Report Detail
    Go To    http://localhost:3001/admin/reports/${REPORT_ID}
    Wait Until Element Is Visible    xpath=//select    15s
    Capture Page Screenshot    detail_loaded.png


Update Status
    [Arguments]    ${status_value}    ${note}

    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight);
    Sleep    1s

    Select From List By Value    xpath=//select    ${status_value}
        Capture Page Screenshot    status_selected.png

    Execute JavaScript
    ...    var el = document.querySelector("textarea");
    ...    el.value = "${note}";
    ...    el.dispatchEvent(new Event('input', { bubbles: true }));
    ...    el.dispatchEvent(new Event('change', { bubbles: true }));
       Capture Page Screenshot    note_entered.png

    Sleep    1s

    Execute JavaScript
    ...    document.evaluate("//button[normalize-space()='บันทึก']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
        Capture Page Screenshot    saved.png

    Sleep    3s

    Reload Page
    Wait Until Element Is Visible    xpath=//select    10s

    ${selected_label}=    Get Selected List Label    xpath=//select
    Should Contain    ${selected_label}    ${status_value}

    ${saved_note}=    Get Value    xpath=//textarea
    Should Be Equal    ${saved_note}    ${note}

    Capture Page Screenshot    status_change.png
