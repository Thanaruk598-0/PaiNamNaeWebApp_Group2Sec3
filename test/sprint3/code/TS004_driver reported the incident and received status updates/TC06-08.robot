*** Settings ***
Library    SeleniumLibrary

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${URL}            http://localhost:3001/login
${BROWSER}        chrome

${ADMIN_USER}     admin123
${ADMIN_PASS}     123456789

${DRIVER_USER}    North322
${DRIVER_PASS}    t1234567

${IMAGE_PATH}     ${CURDIR}/test.png

${MYREPORT_URL}   http://localhost:3001/myReports


*** Test Cases ***

TC15 Driver Can Submit Report Successfully
    Login As Driver
    Open My Reports
    Create New Report
    Submit Report
    Verify Success Message
    Logout

TC16 Admin Updates Latest Report And Driver Sees Update
    Login As Admin
    Open Admin Reports
    Open Latest Report Detail
    Update Status To InProgress
    Logout
    Login As Driver
    Open My Reports
    Logout

TC17 Driver Receives Notification
    Login As Driver
    Open Notification
    Verify Notification Message
    Logout


*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.7s


# ================= LOGIN =================

Login As Driver
    Go To    ${URL}
    Wait Until Element Is Visible    id=identifier    15s
    Input Text    id=identifier    ${DRIVER_USER}
    Input Text    xpath=//input[@type="password"]    ${DRIVER_PASS}
    Click Element    xpath=//button[@type="submit"]
    Wait Until Element Is Not Visible    id=identifier    15s

Login As Admin
    Go To    ${URL}
    Wait Until Element Is Visible    id=identifier    15s
    Input Text    id=identifier    ${ADMIN_USER}
    Input Text    xpath=//input[@type="password"]    ${ADMIN_PASS}
    Click Element    xpath=//button[@type="submit"]
    Wait Until Element Is Not Visible    id=identifier    15s

Logout
    Go To    ${URL}
    Wait Until Element Is Visible    id=identifier    15s


# ================= TC16 =================

Open My Reports
    Go To    ${MYREPORT_URL}
    Wait Until Page Contains    รายงานของฉัน    15s
    Capture Page Screenshot    myreports.png


Create New Report

    Wait Until Element Is Visible    xpath=(//select)[1]    10s
    Select From List By Index        xpath=(//select)[1]    1
    Capture Page Screenshot    trip_selected.png

    Wait Until Element Is Visible    xpath=(//select)[2]    10s
    Select From List By Label        xpath=(//select)[2]    เทคนิค
    Capture Page Screenshot    category_selected.png
  
    Wait Until Element Is Visible    xpath=(//select)[3]    10s
    Select From List By Label        xpath=(//select)[3]    ระบบคำนวณราคาผิด
    Capture Page Screenshot    topic_selected.png

    Wait Until Element Is Visible    xpath=//button[normalize-space()='ปานกลาง']    10s
    Click Element    xpath=//button[normalize-space()='ปานกลาง']
    Capture Page Screenshot    priority_selected.png

    Wait Until Element Is Visible    xpath=//textarea[contains(@placeholder,'อธิบาย')]    10s
    Input Text    xpath=//textarea[contains(@placeholder,'อธิบาย')]    มีการคำรวณราคาผิดพลาด
    Capture Page Screenshot    description_entered.png

    Choose File    xpath=//input[@type='file']    ${IMAGE_PATH}
    Capture Page Screenshot    image_uploaded.png

    Wait Until Element Is Visible    xpath=//div[contains(@class,'gm-style')]    10s
    Capture Page Screenshot    location_auto.png


Submit Report
    Scroll Element Into View    xpath=//button[contains(.,'ส่งรายงาน')]
    Capture Page Screenshot    before_submit.png
    Click Element    xpath=//button[contains(.,'ส่งรายงาน')]
    Capture Page Screenshot    submit_clicked.png


Verify Success Message
    Wait Until Page Contains    ส่งรายงานเรียบร้อยแล้ว    15s
    Capture Page Screenshot    success.png


# ================= TC17 =================

Open Admin Reports
    Go To    http://localhost:3001/admin/reports
    Wait Until Page Contains    ผู้แจ้ง    15s
    Capture Page Screenshot    admin_reports.png


Open Latest Report Detail
    Execute JavaScript    window.scrollTo(0, 500)
    Sleep    1s
    Capture Page Screenshot    before_click_detail.png

    Execute JavaScript
    ...    document.querySelectorAll("button[title='ดู/แก้ไข']")[0].click();

    Wait Until Element Is Visible    xpath=//select    15s
    Capture Page Screenshot    detail_page.png


Update Status To InProgress

    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    1s

    # ---------- เลือกสถานะผ่าน JS ----------
    Execute JavaScript
    ...    var select = document.querySelector("select");
    ...    select.value = "IN_PROGRESS";
    ...    select.dispatchEvent(new Event('change', { bubbles: true }));

    Sleep    1s
    Capture Page Screenshot    selected.png

    # ---------- รอ textarea ----------
    Wait Until Element Is Visible
    ...    xpath=//textarea[contains(@placeholder,'หมายเหตุ')]
    ...    15s

    # ---------- ใส่หมายเหตุผ่าน JS ----------
    Execute JavaScript
    ...    var el = document.querySelector("textarea");
    ...    el.value = "กำลังดำเนินการตรวจสอบข้อมูล";
    ...    el.dispatchEvent(new Event('input', { bubbles: true }));

    Capture Page Screenshot    ote_entered.png

    Sleep    1s

    # ---------- กดบันทึกผ่าน JS ----------
    Execute JavaScript
    ...    document.querySelectorAll("button").forEach(btn => {
    ...        if(btn.innerText.includes("บันทึก")) btn.click();
    ...    });

    Capture Page Screenshot    save_clicked.png

    Sleep    3s
    Reload Page

    Wait Until Element Is Visible    xpath=//select    15s
    Capture Page Screenshot    after_reload.png

    ${selected_label}=    Get Selected List Label    xpath=//select
    Should Contain    ${selected_label}    กำลังดำเนินการ

    Capture Page Screenshot    status_verified.png
# ================= TC18 =================

Open Notification
    Wait Until Element Is Visible    xpath=//button//*[name()='svg']    15s
    Capture Page Screenshot    before_open_notification.png

    Click Element    xpath=//button//*[name()='svg']

    Wait Until Keyword Succeeds    20s    2s
    ...    Page Should Contain    อัปเดตสถานะรายงาน

    Capture Page Screenshot    notification_open.png


Verify Notification Message
    Page Should Contain    อัปเดตสถานะรายงาน
    Capture Page Screenshot    notification_verified.png