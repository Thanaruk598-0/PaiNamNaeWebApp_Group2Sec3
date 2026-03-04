*** Settings ***
Library    SeleniumLibrary

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        chrome
${URL}            http://localhost:3001/login
${USERNAME}       User01
${PASSWORD}       t1234567

*** Test Cases ***
Verify User Can View Submitted Reports
    Login To System
    Go To My Reports Page
    Verify Reports Displayed Correctly

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s
    Capture Page Screenshot    view_login_open.png

Login To System
    Wait Until Element Is Visible    id=identifier    15s
    Capture Page Screenshot    view_login_page.png

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Capture Page Screenshot    view_login_filled.png

    Click Element    xpath=//button[normalize-space()="เข้าสู่ระบบ"]
    Wait Until Element Is Not Visible    id=identifier    15s
    Capture Page Screenshot    view_login_success.png

Go To My Reports Page
    Go To    http://localhost:3001/myReports
    Wait Until Location Contains    myReports    10s
    Capture Page Screenshot    view_myreports_page.png

Verify Reports Displayed Correctly
    Location Should Contain    myReports

    Wait Until Element Is Visible    xpath=//h3[contains(@class,'font-medium')]    10s
    Capture Page Screenshot    view_report_list_loaded.png

    Page Should Contain Element    xpath=//span[normalize-space()="คนขับ"]
    Capture Page Screenshot    view_category_verified.png

    Page Should Contain Element    xpath=//span[normalize-space()="HIGH"]
    Capture Page Screenshot    view_priority_verified.png

    Page Should Contain Element    xpath=//span[contains(text(),"แก้ไขแล้ว")]
    Capture Page Screenshot    view_status_verified.png

    Page Should Contain Element
    ...    xpath=//*[contains(text(),"คนขับ ขับรถหวาดเสียวและตะโกนด่ารถคันอื่นๆ ตลอด")]
    Capture Page Screenshot    view_description_verified.png

    Page Should Contain Element
    ...    xpath=//*[contains(text(),"ดำเนินการแก้ไขเรียบร้อยแล้ว")]
    Capture Page Screenshot    view_admin_note_verified.png

    Page Should Contain Element
    ...    xpath=//span[contains(text(),"13.") and contains(text(),",")]
    Capture Page Screenshot    view_location_verified.png

    Page Should Contain Element
    ...    xpath=//p[contains(text(),"256")]
    Capture Page Screenshot    view_date_verified.png

    ${image_count}=    Get Element Count    xpath=//img[contains(@src,"http")]
    Should Be True    ${image_count} > 0
    Capture Page Screenshot    view_image_verified.png
