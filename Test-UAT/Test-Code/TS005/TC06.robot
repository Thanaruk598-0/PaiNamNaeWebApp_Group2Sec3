*** Settings ***
Library    SeleniumLibrary

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        chrome
${URL}            http://localhost:3001/login
${USERNAME}       admin123
${PASSWORD}       123456789
${REPORT_ID}      cmlro327q0004124t4t68g2cg


*** Test Cases ***
Verify Admin Can View Report Detail
    Login As Admin
    Open Report Detail
    Verify Report Detail Displayed Correctly


*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s
    Capture Page Screenshot    detail_login_open.png


Login As Admin
    Wait Until Element Is Visible    id=identifier    15s
    Capture Page Screenshot    detail_login_page.png

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Capture Page Screenshot    detail_login_filled.png

    Click Element    xpath=//button[normalize-space()="เข้าสู่ระบบ"]
    Wait Until Element Is Not Visible    id=identifier    15s
    Capture Page Screenshot    detail_login_success.png


Open Report Detail
    Go To    http://localhost:3001/admin/reports/${REPORT_ID}
    Wait Until Location Contains    admin/reports    15s
    Wait Until Element Is Visible    xpath=//select    15s
    Capture Page Screenshot    detail_page_loaded.png


Verify Report Detail Displayed Correctly

    Page Should Contain    ผู้แจ้ง
    Page Should Contain    User1nakub nakub
    Page Should Contain    User1@gmail.com
    Page Should Contain    1234567891
    Capture Page Screenshot    detail_user_info_verified.png

    Page Should Contain    หัวข้อ
    Page Should Contain    ขับรถและพูดจาไม่สุภาพ
    Capture Page Screenshot    detail_title_verified.png

    Page Should Contain    รายละเอียด
    Page Should Contain    คนขับ ขับรถหวาดเสียวและตะโกนด่ารถคันอื่นๆ ตลอด
    Capture Page Screenshot    detail_description_verified.png

    Page Should Contain    ประเภทเหตุการณ์
    Page Should Contain Element    xpath=//span[contains(text(),"คนขับ")]
    Capture Page Screenshot    detail_category_verified.png

    Page Should Contain    ระดับความสำคัญ
    Page Should Contain Element    xpath=//span[contains(text(),"HIGH")]
    Capture Page Screenshot    detail_priority_verified.png

    Page Should Contain    สถานะปัจจุบัน
    Page Should Contain    รอดำเนินการ
    Capture Page Screenshot    detail_status_verified.png

    Page Should Contain    ตำแหน่งเหตุการณ์
    Page Should Contain Element    xpath=//*[contains(text(),"16.")]
    Capture Page Screenshot    detail_location_verified.png

    Page Should Contain Element
    ...    xpath=//*[contains(@class,"gm-style") or contains(@class,"leaflet")]
    Capture Page Screenshot    detail_map_verified.png

    Page Should Contain Element    xpath=//*[contains(text(),"256")]
    Capture Page Screenshot    detail_date_verified.png

    Page Should Contain    อัปเดตล่าสุด
    Page Should Contain    วันที่แจ้ง
    Capture Page Screenshot    detail_update_verified.png

